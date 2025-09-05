#include "../common/stdctez.mligo"
#import "../common/errors.mligo" "Errors"
#import "context.mligo" "Context"
#import "events.mligo" "Events"

(** A half dex is defined by:
      - An ordered liquidity share [(tau_0, tau_1)]
      - A reserve of the 'self' token [r0 : tau_0]
      - A reserve of the 'proceeds' token [r1 : tau_1]
      - A subsidy owed by ovens to the dex (in ctez) [s : CTEZ]
      - A fee index [f : nat]
    Each account may own some shares in the dex. 

    The dex is parameterized by a capability context for:
      - transferring the self token
      - transferring the proceeds token
      - computing the target quantity of the 'self' token in the half dex
      - applying the target price to swap amount
*)

type environment = {
  transfer_self : Context.t -> address -> nat -> operation; 
  transfer_proceeds : Context.t -> address -> nat -> operation; 
  get_target_self_reserves : Context.t -> nat;
  div_by_target : Context.t -> nat -> nat;
}

type liquidity_owner = { 
  liquidity_shares : nat; (** the amount of liquidity shares owned by the account. *)
  proceeds_owed : nat;  (** the amount of the proceeds token owed to the dex by the account. *)
  subsidy_owed : nat;  (** the amount of ctez subsidy owed to the dex by the account. *)
}

type t = { 
  liquidity_owners : (address, liquidity_owner) big_map; (** map of liquidity owners. *)
  total_liquidity_shares : nat;  (** total amount of liquidity shares. *)
  self_reserves : nat; (** total amount of liquidity. *)
  proceeds_debts: nat; (** used to simplify analytics *)
  proceeds_reserves : nat; (** total amount accumulated from proceeds + proceeds_debts *)
  subsidy_debts: nat; (** used to simplify analytics *)
  subsidy_reserves : nat; (** total amount accumulated from subsidy + subsidy_debts *)
  fee_index : Float64.t; (** the fee index. *)
}

let default_liquidity_owner = { liquidity_shares = 0n ; proceeds_owed = 0n ; subsidy_owed = 0n }

let find_liquidity_owner (t : t) (owner : address) : liquidity_owner = 
  Option.value default_liquidity_owner (Big_map.find_opt owner t.liquidity_owners)

let set_liquidity_owner (t : t) (owner : address) (liquidity_owner : liquidity_owner) : t = 
  { t with liquidity_owners = Big_map.update owner (Some liquidity_owner) t.liquidity_owners }

let update_liquidity_owner (t : t) (owner : address) (f : liquidity_owner -> liquidity_owner) : t = 
  let liquidity_owner = find_liquidity_owner t owner in
  let liquidity_owner = f liquidity_owner in
  set_liquidity_owner t owner liquidity_owner

type add_liquidity = { 
  owner: address; (** the address that will own the liquidity shares. *)
  amount_deposited: nat; (** the amount of the 'self' token to deposit. *)
  min_liquidity: nat; (** the minimum amount of liquidity shares to add. *)
  deadline : timestamp; (** the deadline for the transaction. *)
}

[@inline]
let get_redeemed_tokens (lqt : nat) (token_reserves : nat) (total_lqt : nat) : nat = 
  (* The redeem rate is defined as 
        RX_i(t_0, t_1) := r_i / total(t_0, t_1)
  *)
  (* In the absence of liquidity in the DEX, we assume a minimum amount of liquidity *)
  (lqt * token_reserves) / (max total_lqt 1n)

[@inline]
let get_deposited_lqt (token_amount : nat) (token_reserves: nat) (total_lqt: nat) : nat = 
  (* The redeem amount is defined as
      lqt = x RX_i(t_0, t_1)
     Thus
      x = (lqt * total(t_0, t_1)) / reserve
  *)
  (* In the absence of liquidity in the DEX, we assume a minimum amount of liquidity *)
  (token_amount * (max total_lqt 1n)) / (max token_reserves 1n)

[@inline]
let get_deposited_tokens (new_total_lqt: nat) (prev_total_lqt : nat) (token_reserves: nat) : nat * nat =
  (* In the absence of liquidity in the DEX, we assume a minimum amount of liquidity *)
  let new_token_reserves = ceil_div 
    (new_total_lqt * token_reserves) 
    (max prev_total_lqt 1n) in
  let deposited_tokens = subtract_nat new_token_reserves token_reserves Errors.incorrect_subtraction in
  (deposited_tokens, new_token_reserves)

let add_liquidity
    (t : t)
    ({ owner; amount_deposited; min_liquidity; deadline } : add_liquidity)
    : t =
  let prev_total_liquidity_shares = t.total_liquidity_shares in
  let d_liquidity = get_deposited_lqt amount_deposited t.self_reserves prev_total_liquidity_shares in
  let total_liquidity_shares = prev_total_liquidity_shares + d_liquidity in
  let () = Assert.Error.assert (d_liquidity >= min_liquidity) Errors.insufficient_liquidity_created in
  let () = Assert.Error.assert (Tezos.get_now () <= deadline) Errors.deadline_has_passed in
  let d_proceeds, proceeds_reserves = get_deposited_tokens total_liquidity_shares prev_total_liquidity_shares t.proceeds_reserves in
  let d_subsidy, subsidy_reserves = get_deposited_tokens total_liquidity_shares prev_total_liquidity_shares t.subsidy_reserves in
  let t = update_liquidity_owner t owner (fun liquidity_owner -> { 
    liquidity_owner with
    liquidity_shares = liquidity_owner.liquidity_shares + d_liquidity;
    proceeds_owed = liquidity_owner.proceeds_owed + d_proceeds;
    subsidy_owed = liquidity_owner.subsidy_owed + d_subsidy;
  }) in
  { 
    t with
    total_liquidity_shares = total_liquidity_shares;
    self_reserves = t.self_reserves + amount_deposited;
    proceeds_debts = t.proceeds_debts + d_proceeds;
    proceeds_reserves = proceeds_reserves;
    subsidy_debts = t.subsidy_debts + d_subsidy;
    subsidy_reserves = subsidy_reserves;
  }

[@inline]
let subtract_debt 
    (owner_amount : nat)
    (owner_debt : nat) 
    (dex_total_reserves : nat)
    (dex_total_debts : nat)
    : nat * nat = 
  if owner_amount < owner_debt 
  then 
    (abs (owner_debt - owner_amount), 0n)
  else 
    let dex_balance = clamp_nat (dex_total_reserves - dex_total_debts) in
    let redeem_amount = abs (owner_amount - owner_debt) in
    (0n, min redeem_amount dex_balance)

[@inline]
let remove_tokens
    (liquidity_redeemed: nat)
    (total_liquidity_shares: nat)
    (owner_debt: nat)
    (dex_total_reserves: nat)
    (dex_total_debts: nat)
    (min_tokens_received)
    (insufficient_redeemed_amount_error: string)
    : nat * nat * nat * nat =
  let tokens_amount = get_redeemed_tokens liquidity_redeemed dex_total_reserves total_liquidity_shares in
  let new_owner_debt, tokens_redeemed = subtract_debt tokens_amount owner_debt dex_total_reserves dex_total_debts in
  let () = Assert.Error.assert (tokens_redeemed >= min_tokens_received) insufficient_redeemed_amount_error in
  let new_dex_total_reserves = subtract_nat dex_total_reserves tokens_amount Errors.incorrect_subtraction in
  let new_dex_total_debts = subtract_nat (dex_total_debts + new_owner_debt) owner_debt Errors.incorrect_subtraction in
  (new_dex_total_reserves, new_dex_total_debts, new_owner_debt, tokens_redeemed)


type remove_liquidity = {
  [@annot:to]
  to_: address; (** the address to receive the tokens *)
  liquidity_redeemed : nat; (** the amount of liquidity shares to redeem *)
  min_self_received : nat; (* minimum amount of tez to receive *)
  min_proceeds_received : nat; (* minimum amount of ctez to receive *)
  min_subsidy_received : nat; (* minimum amount of ctez subsidy to receive *)
  deadline : timestamp; (* deadline for the transaction *)
}

type remove_liquidity_amounts = {
  self_redeemed : nat;
  proceeds_redeemed : nat;
  subsidy_redeemed : nat;
}

type remove_liquidity_result = {
  dex: t;
  ops: operation list;
  amounts: remove_liquidity_amounts;
}

let remove_liquidity
    (t : t)
    (ctxt : Context.t)
    (env : environment)
    (is_self_token_tez: bool)
    ({ 
      to_;
      liquidity_redeemed;
      min_self_received;
      min_proceeds_received;
      min_subsidy_received;
      deadline;
    } : remove_liquidity)
    : remove_liquidity_result =
  let () = Assert.Error.assert (Tezos.get_now () <= deadline) Errors.deadline_has_passed in
  let owner = Tezos.get_sender () in
  let liquidity_owner = find_liquidity_owner t owner in
  let prev_liquidity_shares = liquidity_owner.liquidity_shares in 
  let prev_total_liquidity_shares = t.total_liquidity_shares in
  let () = Assert.Error.assert (prev_liquidity_shares >= liquidity_redeemed) Errors.insufficient_liquidity in
  let liquidity_shares = subtract_nat prev_liquidity_shares liquidity_redeemed Errors.incorrect_subtraction in
  let total_liquidity_shares = subtract_nat prev_total_liquidity_shares liquidity_redeemed Errors.incorrect_subtraction in

  let self_redeemed = get_redeemed_tokens liquidity_redeemed t.self_reserves prev_total_liquidity_shares in
  let () = Assert.Error.assert (self_redeemed >= min_self_received) Errors.insufficient_self_received in
  let self_reserves = subtract_nat t.self_reserves self_redeemed Errors.incorrect_subtraction in

  let proceeds_reserves, proceeds_debts, proceeds_owed, proceeds_redeemed = remove_tokens 
    liquidity_redeemed prev_total_liquidity_shares liquidity_owner.proceeds_owed 
    t.proceeds_reserves t.proceeds_debts min_proceeds_received Errors.insufficient_proceeds_received in 
  
  let subsidy_reserves, subsidy_debts, subsidy_owed, subsidy_redeemed = remove_tokens 
    liquidity_redeemed prev_total_liquidity_shares liquidity_owner.subsidy_owed 
    t.subsidy_reserves t.subsidy_debts min_subsidy_received Errors.insufficient_subsidy_received in 
  
  let t = { 
    t with
    total_liquidity_shares;
    self_reserves;
    proceeds_debts;
    proceeds_reserves;
    subsidy_debts;
    subsidy_reserves;
  } in
  let t = update_liquidity_owner t owner (fun liquidity_owner -> { 
    liquidity_owner with
    liquidity_shares;
    proceeds_owed;
    subsidy_owed;
  }) in

  let unshift_self_token_transfer (ops: operation list) = if ( self_redeemed > 0n ) 
    then env.transfer_self ctxt to_ self_redeemed :: ops 
    else ops in

  let unshift_proceeds_transfer (ops: operation list) = if ( proceeds_redeemed > 0n ) 
    then env.transfer_proceeds ctxt to_ proceeds_redeemed :: ops 
    else ops in

  let ops = if (is_self_token_tez) 
    then unshift_proceeds_transfer (unshift_self_token_transfer []) 
    else unshift_self_token_transfer (unshift_proceeds_transfer []) in
  let ops = if ( subsidy_redeemed > 0n ) 
    then Context.transfer_ctez ctxt (Tezos.get_self_address ()) to_ subsidy_redeemed :: ops 
    else ops in
  { 
    dex = t;
    ops;
    amounts = { self_redeemed; proceeds_redeemed; subsidy_redeemed; }
  }


[@inline]
let collect_tokens 
    (liquidity_shares : nat)
    (total_liquidity_shares: nat)
    (owner_debts: nat)
    (dex_reserves : nat)
    (dex_total_debts : nat)
    : nat * nat * nat =
  let owner_tokens = get_redeemed_tokens
    liquidity_shares
    dex_reserves
    total_liquidity_shares in
  let _, amount_to_withdrawn = subtract_debt owner_tokens owner_debts dex_reserves dex_total_debts in
  let new_dex_total_debts = dex_total_debts + amount_to_withdrawn in
  (owner_tokens, amount_to_withdrawn, new_dex_total_debts)

type collect_proceeds_and_subsidy = { to_: address }

type collect_proceeds_and_subsidy_amounts = {
  proceeds_redeemed : nat;
  subsidy_redeemed : nat;
}

type collect_proceeds_and_subsidy_result = {
  dex: t;
  ops: operation list;
  amounts: collect_proceeds_and_subsidy_amounts;
}

let collect_proceeds_and_subsidy
    (t : t)
    (ctxt : Context.t)
    (env : environment)
    ({ to_ } : collect_proceeds_and_subsidy)
    : collect_proceeds_and_subsidy_result =
  let owner = Tezos.get_sender () in
  let liquidity_owner = find_liquidity_owner t owner in
  let liquidity_shares = liquidity_owner.liquidity_shares in
  let total_liquidity_shares = t.total_liquidity_shares in
  let proceeds_owed, proceeds_redeemed, proceeds_debts = collect_tokens 
    liquidity_shares total_liquidity_shares liquidity_owner.proceeds_owed t.proceeds_reserves t.proceeds_debts in
  let subsidy_owed, subsidy_redeemed, subsidy_debts = collect_tokens 
    liquidity_shares total_liquidity_shares liquidity_owner.subsidy_owed t.subsidy_reserves t.subsidy_debts in
  
  let t = {
    t with
    proceeds_debts;
    subsidy_debts;
  } in
  let t = set_liquidity_owner t owner { 
    liquidity_owner with
    proceeds_owed;
    subsidy_owed;
  } in

  let ops = if (proceeds_redeemed > 0n) 
    then [env.transfer_proceeds ctxt to_ proceeds_redeemed] 
    else [] in
  let ops = if (subsidy_redeemed > 0n) 
    then Context.transfer_ctez ctxt (Tezos.get_self_address ()) to_ subsidy_redeemed :: ops 
    else ops in

  { 
    dex = t;
    ops;
    amounts = { proceeds_redeemed; subsidy_redeemed; }
  }


module Curve = struct
  (** The marginal price [dp/du] is the derivative of the price function [p(u)] with respect to the
      characteristic quantity [u = min(q/Q, 1)] where [q] is the current amount of the dex's 'self'
      token and [Q] is the target amount.

      The marginal price function is given as [dp/du(u) = Q * (21 - 3 * u + 3 * u^2 - u^3) / 20].
      Meaning the price of dex's 'self' token in 'proceed' token units is given by
      {v
        p(u_0 -> u_1) = ∫_{u_0}^{u_1} dp/du(u) du
                      = [Q * (21 * u - 3 * u^2 / 2 + u^3 - u^4 / 4) / 20]_{u_1}^{u_0}
      v}
      for [u_1 < u_0]

      For a swap we need to determine [y] for a given [x] such that [p(q/Q -> (q - y) / Q) = x] where
      [x] is the amount of 'proceed' token units to be traded for [y] 'self' token units.

      Solving the above equation for [y] gives irrational solutions. We instead use Newton's method to
      find an approximate solution. The Newton step is given as
      {v
        y_{i + 1} = y_i - (p(q/Q, (q - y_i)/Q) - x) / p'(q/Q, (q - y_i)/Q)
                  = FullSimplify[%]
                  = 3 y_i⁴ + 6 y_i² (q - Q)² + 8 y_i³ (-q + Q) + 80 Q³ x
                    -----------------------------------------------------------
                    4 ((y_i - q)³ + 3 (y_i - q)² Q + 3 (y_i - q) Q² + 21 Q³)
      v}

      Note that since marginal price function is generally very nearly linear in the region [0, 1],
      so Newton converges stupidly fast.
  *)

  [@inline]
  let newton_step (x : nat) (y : nat) (q : nat) (_Q : nat) : int =
      (* Computes
          3 y⁴ + 6 y² (q - Q)² + 8 y³ (-q + Q) + 80 Q³ x 
          ---------------------------------------------------
          4 ((y - q)³ + 3 (y - q)² Q + 3 (y - q) Q² + 21 Q³)
      *)
      let dq = min y q in
      let q_m_Q = q - _Q in
      let dq_m_q = dq - q in
      let dq_m_q_sq = dq_m_q * dq_m_q in
      let dq_m_q_cu = dq_m_q_sq * dq_m_q in
      let _Q_sq = _Q * _Q in
      let _Q_cu = _Q_sq * _Q in
      let num = 3 * dq * dq * dq * dq + 6 * dq * dq * q_m_Q * q_m_Q + 8 * dq * dq * dq * (-q_m_Q) + 80 * _Q_cu * x in
      let denom = 4 * (dq_m_q_cu + 3 * dq_m_q_sq * _Q + 3 * dq_m_q * _Q_sq + 21 * _Q_cu) in
      num / denom

  [@inline]
  let swap_using_exceed_liquidity (x : nat) (q : nat) (_Q : nat) : nat * nat =
    let non_targeted_q = clamp_nat (q - _Q) in
    let rest_x = clamp_nat (x - non_targeted_q) in
    let untaxed_y = min x non_targeted_q in
    rest_x, untaxed_y 
    
  [@inline]
  let swap_using_incentivized_liquidity (x : nat) (q : nat) (_Q : nat) : nat =
      let q = min q _Q in
      (* Initial guess for [y] is [x] *)
      let y = x in
      let y = clamp_nat (newton_step x y q _Q) in 
      let y = clamp_nat (newton_step x y q _Q) in
      let y = clamp_nat (newton_step x y q _Q) in
      clamp_nat (y - y / 1_000_000_000 - 1)

  (** [swap_amount x q _Q] returns the swap amount for trading [x] units of the proceeds token 
      for a half dex with total quantity [q] and target quantity [_Q]. 
  *)
  [@inline]
  let swap_amount
      (t : t) 
      (ctxt : Context.t) 
      (env : environment) 
      (proceeds_amount : nat)
      : nat =
    let x = env.div_by_target ctxt proceeds_amount in
    let q = t.self_reserves in
    let _Q = env.get_target_self_reserves ctxt in
    let x, y = swap_using_exceed_liquidity x q _Q in
    if x = 0n 
      then y
      else y + (swap_using_incentivized_liquidity x q _Q)
end

type swap = {
  [@annot:to]
  to_: address; (** address that will own the 'self' tokens in the swap *)
  proceeds_amount : nat; (** the amount of the 'proceed' token used to buy the 'self' token *)    
  min_self : nat; (** the minimum amount of 'self' tokens to receive *)
  deadline : timestamp; (** deadline for the transaction *)
}

let swap 
    (t : t) 
    (ctxt : Context.t) 
    (env : environment) 
    ({ to_; proceeds_amount; min_self; deadline } : swap)
    : t with_operations =
  let () = Assert.Error.assert (Tezos.get_now () <= deadline) Errors.deadline_has_passed in
  let self_to_sell = Curve.swap_amount t ctxt env proceeds_amount in
  let () = Assert.Error.assert ((self_to_sell >= min_self) && (self_to_sell > 0n)) Errors.insufficient_tokens_bought in
  let t = { 
    t with
    self_reserves = subtract_nat t.self_reserves self_to_sell Errors.insufficient_tokens_liquidity; 
    proceeds_reserves = t.proceeds_reserves + proceeds_amount
  } in
  let transfer_self = env.transfer_self ctxt to_ self_to_sell in
  [ transfer_self ], t
