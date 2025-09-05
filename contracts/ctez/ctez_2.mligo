#include "../common/stdctez.mligo"
#import "../common/errors.mligo" "Errors"
#import "../common/constants.mligo" "Constants"
#import "../oven.mligo" "Oven"
#import "half_dex.mligo" "Half_dex"
#import "context.mligo" "Context"
#import "events.mligo" "Events"

type add_tez_liquidity = { 
  owner : address;
  min_liquidity : nat;
  deadline : timestamp;
}

type add_ctez_liquidity = { 
  owner : address;
  amount_deposited : nat;
  min_liquidity : nat;
  deadline : timestamp;
}

type tez_to_ctez = {
  [@annot:to]
  to_: address; 
  min_ctez_bought : nat;
  deadline : timestamp
}

type ctez_to_tez = {
  [@annot:to]
  to_: address; 
  ctez_sold : nat;
  min_tez_bought : nat;
  deadline : timestamp
}

type create_oven = {
  id : nat; 
  delegate : key_hash option; 
  depositors : Oven.depositors;
}

type liquidate = { 
  handle : Oven.handle; 
  quantity : nat; 
  [@annot:to]
  to_ : unit contract;
}

type mint_or_burn = { 
  id : nat; 
  quantity : int;
}

type oven = { 
  tez_balance : tez;
  ctez_outstanding : nat;
  address : address;
  fee_index : Float64.t;
}

type withdraw = { 
  id : nat; 
  amount : tez; 
  [@annot:to] 
  to_ : unit contract 
}

type calc_tokens_to_sell = { 
  is_sell_ctez_dex : bool; 
  proceeds_amount : nat;
}

type storage = { 
  ovens : (Oven.handle, oven) big_map;
  last_update : timestamp;
  sell_ctez : Half_dex.t;
  sell_tez  : Half_dex.t;
  context : Context.t;
  last_event_id : nat;
  metadata : (string, bytes) big_map;
  originator : address;
}

type result = storage with_operations

(* Functions *)

let get_oven (handle : Oven.handle) (s : storage) : oven =
  match Big_map.find_opt handle s.ovens with
  | None -> (failwith Errors.oven_not_exists : oven)
  | Some oven -> 
    (* Adjust the amount of outstanding ctez in the oven, record the fee index at that time. *)
    let fee_index = s.sell_ctez.fee_index * s.sell_tez.fee_index in
    let prev_ctez_outstanding = oven.ctez_outstanding in
    let prev_fee_index = oven.fee_index in
    let ctez_outstanding = (prev_ctez_outstanding * fee_index) / prev_fee_index in 
    let fee_index = if prev_ctez_outstanding > 0n 
      then ceil_div (ctez_outstanding * prev_fee_index) prev_ctez_outstanding 
      else fee_index in 
    {oven with fee_index ; ctez_outstanding}

let is_under_collateralized (oven : oven) (target : nat) : bool =
  (15n * oven.tez_balance) < (16n * Float64.mul oven.ctez_outstanding target) * 1mutez

let get_oven_withdraw (oven_address : address) : (tez * (unit contract)) contract =
  match (Tezos.get_entrypoint_opt "%withdraw" oven_address : (tez * (unit contract)) contract option) with
    | None -> (failwith Errors.missing_withdraw_entrypoint : (tez * (unit contract)) contract)
    | Some c -> c

let get_ctez_mint_or_burn (fa12_address : address) : (int * address) contract =
  match (Tezos.get_entrypoint_opt  "%mintOrBurn"  fa12_address : ((int * address) contract) option) with
    | None -> (failwith Errors.missing_mint_or_burn_entrypoint : (int * address) contract)
    | Some c -> c

(* Environments *)

let sell_tez_env : Half_dex.environment = {
  transfer_self = fun (_) (r) (a) -> Context.transfer_xtz r a;
  transfer_proceeds = fun (c) (r) (a) -> Context.transfer_ctez c (Tezos.get_self_address ()) r a;
  get_target_self_reserves = fun (c) -> max (Float64.mul c._Q c.target) 1n;
  div_by_target = fun (c) (amt) -> Float64.mul amt c.target;
}

let sell_ctez_env : Half_dex.environment = {
  transfer_self = fun (c) (r) (a) -> Context.transfer_ctez c (Tezos.get_self_address ()) r a;
  transfer_proceeds = fun (_) (r) (a) -> Context.transfer_xtz r a;
  get_target_self_reserves = fun (c) -> c._Q;
  div_by_target = fun (c) (amt) -> Float64.div amt c.target;
}

(* housekeeping *)

[@inline]
let drift_adjustment 
    (delta : nat)
    (s : storage) 
    : int = // Float64
  let ctxt = s.context in
  let _Qt = sell_tez_env.get_target_self_reserves ctxt in
  let qc = min s.sell_ctez.self_reserves ctxt._Q in
  let qt = min s.sell_tez.self_reserves _Qt in
  let tqc_m_qt = (Float64.mul qc ctxt.target) - qt in
  65536n * delta * tqc_m_qt * tqc_m_qt * tqc_m_qt / (_Qt * _Qt * _Qt)

let fee_rate (q : nat) (_Q : nat) : Float64.t =
  let max_rate = 5845483520n in 
  if 8n * q < _Q  (* if q < 12.5% of _Q *)
    then max_rate (* ~1% / year *)
  else if 8n * q > 7n * _Q (* if q > 87.5% of _Q*) 
    then 0n (* 0% / year *)
    else abs(max_rate  * (7n * _Q - 8n * q)) / (6n * _Q) (* [0%, ~1%] / year *)

let update_fee_index 
    (delta: nat) 
    (outstanding : nat) 
    (_Q : nat) 
    (dex : Half_dex.t) 
    : Half_dex.t * nat = 
  let rate = fee_rate dex.self_reserves _Q in
  let fee_index = dex.fee_index in 
  (* rate is given as a multiple of 2^(-64), roughly [0%, 1%] / year *)
  let new_fee_index = fee_index + Float64.mul (delta * fee_index) rate in
  (* Compute how many ctez have implicitly been minted since the last update *)
  (* We round this down while we round the ctez owed up. This leads, over time, to slightly overestimating the outstanding ctez, which is conservative. *)
  let minted = outstanding * (new_fee_index - fee_index) / fee_index in
  {dex with fee_index = new_fee_index; subsidy_reserves = clamp_nat (dex.subsidy_reserves + minted) }, clamp_nat (outstanding + minted)

let get_actual_state (s : storage) : int * storage =
  let now = Tezos.get_now () in
  if s.last_update <> now then
    let delta = abs (now - s.last_update) in
    let d_drift = drift_adjustment delta s in
    (* This is not homegeneous, but setting the constant delta is multiplied with
       to 1.0 magically happens to be reasonable. Why?
       Because (2^16 * 24 * 3600 / 2^64) * 365.25*24*3600 ~ 0.97%.
       This means that the annualized drift changes by roughly one percentage point per day at most.
    *)
    let drift = s.context.drift in
    let new_drift = drift + d_drift in

    let target = s.context.target in
    let d_target = Float64.mul ((abs drift) * delta) target in
    (* We assume that `target - d_target < 0` never happens for economic reasons.
       Concretely, even drift were as low as -50% annualized, it would take not
       updating the target for 1.4 years for a negative number to occur *)
    let new_target = if drift < 0 
      then subtract_nat target d_target Errors.incorrect_subtraction 
      else target + d_target in
    (* Compute what the liquidity fee should be, based on the ratio of total outstanding ctez to ctez in dexes *)
    let outstanding = match (Tezos.Next.View.call "viewTotalSupply" () s.context.ctez_fa12_address) with
      | None -> (failwith Errors.missing_total_supply_view : nat)
      | Some n-> n in
    let _Q = max (outstanding / 20n) 1n in
    let s = { s with context = {s.context with _Q = _Q }} in
    let sell_ctez, new_outstanding = update_fee_index delta outstanding (sell_ctez_env.get_target_self_reserves s.context) s.sell_ctez in
    let sell_tez, new_outstanding = update_fee_index delta new_outstanding (sell_tez_env.get_target_self_reserves s.context) s.sell_tez in
    let subsidies_minted = new_outstanding - outstanding in
    let context = { s.context with drift = new_drift ; target = new_target } in
    (subsidies_minted, { s with last_update = now ; sell_ctez = sell_ctez ; sell_tez = sell_tez ; context = context })
  else
    (0, s)

let do_housekeeping (s : storage) : result =
  let subsidies_minted, s = get_actual_state s in
  (* Create the operation to explicitly mint the ctez in the FA12 contract, and credit it to the CFMM *)
  let ctez_mint_or_burn = get_ctez_mint_or_burn s.context.ctez_fa12_address in
  let ops = if subsidies_minted > 0 
    then [Tezos.Next.Operation.transaction (subsidies_minted, Tezos.get_self_address ()) 0mutez ctez_mint_or_burn] 
    else [] in
  (ops, s)

(* Entrypoint Functions *)

(** 
  Sets the address of the FA1.2 ctez token contract 
  Parameters: 
    - ctez_fa12_address: address of the FA1.2 contract
  Pre-conditions: Only the originator can call this entrypoint. The ctez_fa12_address must not be set yet.
  Post-conditions: The ctez_fa12_address is set to the given address.
  Errors: 
    - "TEZ_IN_TRANSACTION_DISALLOWED" if there is a tez in transaction
    - "ONLY_ORIGINATOR_CAN_CALL" if not called by the originator
    - "CTEZ_FA12_ADDRESS_ALREADY_SET" if the ctez_fa12_address is already set
  Return: Updated storage with the new ctez_fa12_address 
*)
[@entry]
let set_ctez_fa12_address 
    (ctez_fa12_address : address) 
    (s : storage) 
    : result =
  let () = assert_no_tez_in_transaction () in
  let () = Assert.Error.assert (Tezos.get_sender () = s.originator) Errors.only_originator_can_call in
  let () = Assert.Error.assert (s.context.ctez_fa12_address = Constants.null_address) Errors.ctez_fa12_address_already_set in
  ([], { s with context = { s.context with ctez_fa12_address }})

(**
  Creates a new oven with tez deposit and selected delegate.
  Parameters: 
    - id: The unique identifier for the oven
    - delegate: The optional delegate for the oven
    - depositors: The list of authorized depositors for the oven (Any or Whitelist of addresses)
  Pre-conditions: The the oven with the same id and the same owner must not already exist in the ovens big map.
  Post-conditions:
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies)
    - A new oven entry is created with the specified parameters and added to the ovens big map.
    - A new oven contract is originated with the specified parameters and with tez balance equal to the deposit.
  Errors:
    - "OVEN_ALREADY_EXISTS": Thrown if the handle for the oven already exists in the ovens big map.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12
    - origination_op: The origination operation for the new oven
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping)
      * the new oven
*)
[@entry]
let create_oven 
    ({ id; delegate; depositors } : create_oven) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let handle = { id ; owner = Tezos.get_sender () } in
  let () = Assert.Error.assert (not Big_map.mem handle s.ovens) Errors.oven_already_exists in
  let (origination_op, oven_address) : operation * address =
    Oven.originate_oven delegate (Tezos.get_amount ()) { admin = Tezos.get_self_address () ; handle ; depositors } in
  let oven = {
    tez_balance = (Tezos.get_amount ()); 
    ctez_outstanding = 0n; 
    address = oven_address; 
    fee_index = s.sell_ctez.fee_index * s.sell_tez.fee_index
  } in
  let ovens = Big_map.update handle (Some oven) s.ovens in
  (List.append house_ops [origination_op], { s with ovens })

(* 
  Allows oven owners to withdraw tez from their oven to a recipient while maintaining sufficient collateralization.
  Parameters: 
  - id: The unique identifier of the oven.
  - amount: The amount of tez to withdraw.
  - to: The address of the recipient.
  Pre-conditions: 
  - The transaction must not contain any tez.
  - The oven identified by "id" must exist and belong to the sender.
  Post-conditions: 
  - Housekeeping: recalculates target, drift, ctez outstanding (subsidies)
  - The specified amount of tez is transferred to the recipient.
  - The oven's tez balance is updated.
  Errors: 
  - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
  - "OVEN_NOT_EXISTS": Thrown if sender doesn't have the the oven with specified "id".
  - "EXCESSIVE_TEZ_WITHDRAWAL": Thrown when the remaining tez balance causes undercollateralization after withdrawal.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12
    - withdraw_op: The operation to withdraw the specified amount of tez from the oven to the specified recipient
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping)
      * the updated oven
*)
[@entry]
let withdraw_from_oven
    ({ id; amount; to_ } : withdraw) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let handle = {id = id ; owner = Tezos.get_sender ()} in
  let oven : oven = get_oven handle s in
  let oven_contract = get_oven_withdraw oven.address in
  (* Check for undercollateralization *)
  let new_balance = match (oven.tez_balance - amount) with
    | None -> (failwith Errors.excessive_tez_withdrawal : tez)
    | Some x -> x in
  let oven = {oven with tez_balance = new_balance} in
  let ovens = Big_map.update handle (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  let () = Assert.Error.assert (not is_under_collateralized oven s.context.target) Errors.excessive_tez_withdrawal in
  let withdraw_op = Tezos.Next.Operation.transaction (amount, to_) 0mutez oven_contract in
  (List.append house_ops [withdraw_op], s)

(**
  Registers a deposit to an existing oven by increasing its tez balance. 
  This entrypoint is intended to be called by the oven contract itself.
  Parameters: 
    - handle: The unique identifier for the oven.
    - amount: The amount of tez to be deposited into the oven.
  Pre-conditions: The sender of the transaction must be the oven contract itself.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies)
    - The tez balance of the specified oven is increased by the deposit amount.
  Errors:
    - "OVEN_NOT_EXISTS": Thrown if there is no oven with the specified "handle".
    - "ONLY_OVEN_CAN_CALL": Thrown if the sender is not the oven contract itself.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping)
      * updated oven with the new tez balance.
*)
[@entry]
let register_oven_deposit 
    ({ handle; amount } : Oven.register_deposit) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  (* First check that the call is legit *)
  let oven = get_oven handle s in
  let () = Assert.Error.assert (Tezos.get_sender () = oven.address) Errors.only_oven_can_call in
  (* register the increased balance *)
  let oven = {oven with tez_balance = oven.tez_balance + amount} in
  let ovens = Big_map.update handle (Some oven) s.ovens in
  house_ops, { s with ovens = ovens }

(**
  Description: Liquidates an oven when it is under-collateralized, transferring the collateral to a specified recipient.
  Parameters: 
    - handle: The unique identifier of the oven
    - quantity: The amount of ctez to burn
    - to: The address of the recipient of the collateral
  Pre-conditions: 
    - The transaction must not contain any tez.
    - The oven identified by the handle must exist and be under-collateralized.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies)
    - The specified quantity of ctez is burned.
    - The extracted tez balance is transferred to the recipient.
    - The oven's ctez outstanding and tez balance are updated.
  Errors: 
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
    - "OVEN_NOT_EXISTS": Thrown if the oven with the specified handle does not exist.
    - "NOT_UNDERCOLLATERALIZED": Thrown if the oven is not under-collateralized.
    - "EXCESSIVE_CTEZ_BURNING": Thrown if the quantity of ctez to burn exceeds the oven's outstanding ctez.
    - "INSUFFICIENT_TEZ_IN_OVEN": Thrown if the extracted balance exceeds the oven's tez balance.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - A list of operations including the burning of ctez and transfer of collateral.
    - updated storage with:
      * updated target, drift, ctez outstanding (housekeeping)
      * modified oven state.
*)
[@entry]
let liquidate_oven
    ({ handle; quantity; to_ } : liquidate)
    (s : storage) 
    : result  =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let oven : oven = get_oven handle s in
  let target = s.context.target in
  let () = Assert.Error.assert (is_under_collateralized oven target) Errors.not_undercollateralized in
  let remaining_ctez = match is_nat (oven.ctez_outstanding - quantity) with
    | None -> (failwith Errors.excessive_ctez_burning : nat)
    | Some n -> n in
  let extracted_balance = (Float64.mul (32n * quantity) target) * 1mutez / 31n in
  let new_balance = match oven.tez_balance - extracted_balance with
    | None -> (failwith Errors.insufficient_tez_in_oven : tez)
    | Some x -> x in
  let oven = {oven with ctez_outstanding = remaining_ctez ; tez_balance = new_balance} in
  let ovens = Big_map.update handle (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  let oven_contract = get_oven_withdraw oven.address in
  let op_take_collateral = Tezos.Next.Operation.transaction (extracted_balance, to_) 0mutez oven_contract in
  let ctez_mint_or_burn = get_ctez_mint_or_burn s.context.ctez_fa12_address in
  let op_burn_ctez = Tezos.Next.Operation.transaction (-quantity, Tezos.get_sender ()) 0mutez ctez_mint_or_burn in
  List.append house_ops [op_burn_ctez ; op_take_collateral], s

(** 
  Mint or burn ctez tokens in an oven.
  Parameters:
    - id: The unique identifier of the oven.
    - quantity: The amount of ctez to mint or burn.
  Pre-conditions:
    - The transaction must not contain any tez.
    - The oven identified by "id" must exist and belong to the sender.
  Post-conditions:
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies)
    - The specified amount of ctez is minted or burned in the oven.
    - The oven's ctez balance (ctez_outstanding) is updated.
  Errors:
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
    - "OVEN_NOT_EXISTS": Thrown if sender doesn't have the the oven with specified "id".
    - "EXCESSIVE_CTEZ_BURNING": Thrown when the specified quantity exceeds the oven's outstanding ctez.
    - "EXCESSIVE_CTEZ_MINTING": Thrown when the remaining ctez balance causes undercollateralization after minting.
  Return:
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - mint_or_burn_op: The operation to mint or burn the specified amount of ctez in the oven.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping)
      * updated oven ctez_outstanding balance
*)
[@entry]
let mint_or_burn 
    ({id ; quantity } : mint_or_burn)
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let handle = { id = id ; owner = Tezos.get_sender () } in
  let oven : oven = get_oven handle s in
  let ctez_outstanding = match is_nat (oven.ctez_outstanding + quantity) with
    | None -> (failwith Errors.excessive_ctez_burning : nat)
    | Some n -> n in
  let oven = {oven with ctez_outstanding = ctez_outstanding} in
  let ovens = Big_map.update handle (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  let () = Assert.Error.assert (not is_under_collateralized oven s.context.target) Errors.excessive_ctez_minting in
  let ctez_mint_or_burn = get_ctez_mint_or_burn s.context.ctez_fa12_address in
  let mint_or_burn_op = Tezos.Next.Operation.transaction (quantity, Tezos.get_sender ()) 0mutez ctez_mint_or_burn in
  List.append house_ops [mint_or_burn_op], s

(* dex *)

(**
  Adds tez liquidity to the dex.
  Parameters: 
    - owner: The address of the liquidity provider (who will own the liquidity shares).
    - min_liquidity: The minimum liquidity shares expected to be minted.
    - deadline: The latest time by which the transaction must be included.
  Pre-conditions: 
    - The transaction must contain tez to deposit.
    - The current time must be less than or equal to the deadline.
    - The minted liquidity shares must be greater than or equal to the minimum required.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The tez is deposited into the liquidity pool, and liquidity shares are minted for the specified owner.
    - The contract's tez balance is increased by the amount sent in the transaction.
  Errors: 
    - "INSUFFICIENT_LIQUIDITY_CREATED": Thrown if the minted liquidity shares are below the minimum required.
    - "DEADLINE_HAS_PASSED": Thrown if the current time exceeds the deadline.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated selling tez dex with the new liquidity state.
*)
[@entry]
let add_tez_liquidity 
    ({ owner; min_liquidity; deadline } : add_tez_liquidity) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let amount_deposited = tez_to_nat (Tezos.get_amount ()) in
  let p : Half_dex.add_liquidity = { owner; amount_deposited; min_liquidity; deadline } in
  let sell_tez = Half_dex.add_liquidity s.sell_tez p in
  house_ops, { s with sell_tez }

[@entry]
(** 
  Adds ctez liquidity to the dex.
  Parameters: 
    - owner: The address of the liquidity provider (who will own the liquidity shares).
    - amount_deposited: The amount of ctez to add to the dex.
    - min_liquidity: The minimum liquidity shares expected to be minted.
    - deadline: The latest time by which the transaction must be included.
  Pre-conditions: 
    - The transaction must not contain any tez.
    - The current time must be less than or equal to the deadline.
    - The minted liquidity shares must be greater than or equal to the minimum required.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The ctez is deposited into the liquidity pool, and liquidity shares are minted for the specified owner.
    - The sender's ctez balance is decreased by the amount of ctez added to the dex.
    - The contract ctez balance is increased by the amount of ctez added to the dex.
  Errors: 
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
    - "INSUFFICIENT_LIQUIDITY_CREATED": Thrown if the amount of liquidity created is less than the minimum specified.
    - "DEADLINE_HAS_PASSED": Thrown if the deadline has passed.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - transfer_ctez_op: The operation to transfer the specified amount of ctez from the user to the contract.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated selling tez dex with the new liquidity state.
*)
let add_ctez_liquidity 
    ({ owner; amount_deposited; min_liquidity; deadline } : add_ctez_liquidity) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let p : Half_dex.add_liquidity = { owner; amount_deposited; min_liquidity; deadline } in
  let sell_ctez = Half_dex.add_liquidity s.sell_ctez p in
  let transfer_ctez_op = Context.transfer_ctez s.context (Tezos.get_sender ()) (Tezos.get_self_address ()) amount_deposited in
  List.append house_ops [transfer_ctez_op], { s with sell_ctez }


let append_remove_liquidity_event 
    (amounts : Half_dex.remove_liquidity_amounts)
    (is_sell_ctez_dex : bool)
    (s : storage)
    (ops : operation list)
    : result =
  let id = s.last_event_id + 1n in
  let { self_redeemed; proceeds_redeemed; subsidy_redeemed; } = amounts in
  let event_params: Events.remove_liquidity = {
    id;
    is_sell_ctez_dex;
    self_redeemed;
    proceeds_redeemed;
    subsidy_redeemed;
  } in
  let ops = Events.create_remove_liquidity_event_op event_params :: ops in
  let s = { s with last_event_id = id } in
  ops, s

(*
  Removes tez liquidity from the dex.
  Parameters: 
    - to: The address to receive the tokens
    - liquidity_redeemed: The amount of liquidity shares to burn
    - min_self_received: The minimum amount of tez to receive
    - min_proceeds_received: The minimum amount of ctez to receive
    - min_subsidy_received: The minimum amount of ctez subsidy to receive
    - deadline: The deadline for the transaction
  Pre-conditions: 
    - The transaction must not contain any tez.
    - The current time must be less than or equal to the deadline.
    - The received amounts should be greater than or equal to the corresponding minimum amounts specified in the parameters.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The owner state are updated in tez dex.
    - The owner's tez balance is increased by the self_received amount.
    - The owner's ctez balance is increased by the proceeds_received + subsidy_received amounts.
    - The contract's tez balance is decreased by the self_received amount.
    - The contract's ctez balance is decreased by the proceeds_received + subsidy_received amounts.
  Errors: 
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
    - "INSUFFICIENT_LIQUIDITY": Thrown if the amount of owner liquidity is less than the liquidity_redeemed specified.
    - "INSUFFICIENT_SELF_RECEIVED": Thrown if the self_received amount is less than the min_self_received specified.
    - "INSUFFICIENT_PROCEEDS_RECEIVED": Thrown if the proceeds_received amount is less than the min_proceeds_received specified.
    - "INSUFFICIENT_SUBSIDY_RECEIVED": Thrown if the subsidy_received amount is less than the min_subsidy_received specified.
    - "DEADLINE_HAS_PASSED": Thrown if the current time exceeds the deadline.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - ops: transfer operations for self tokens (tez), proceeds (ctez) and subsidy (ctez) from the contract to the receiver specified in the parameters.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated tez dex state and liquidity owner state.
*)
[@entry]
let remove_tez_liquidity 
    (p : Half_dex.remove_liquidity) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let { dex = sell_tez; ops; amounts; } = Half_dex.remove_liquidity s.sell_tez s.context sell_tez_env True p in
  let (ops, s) = append_remove_liquidity_event amounts False s ops in
  List.append house_ops ops, { s with sell_tez }

(*
  Removes ctez liquidity from the dex.
  Parameters: 
    - to: The address to receive the tokens
    - liquidity_redeemed: The amount of liquidity shares to burn
    - min_self_received: The minimum amount of ctez to receive
    - min_proceeds_received: The minimum amount of tez to receive
    - min_subsidy_received: The minimum amount of ctez subsidy to receive
    - deadline: The deadline for the transaction
  Pre-conditions: 
    - The transaction must not contain any tez.
    - The current time must be less than or equal to the deadline.
    - The received amounts should be greater than or equal to the corresponding minimum amounts specified in the parameters.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The owner state are updated in tez dex.
    - The owner's ctez balance is increased by the self_received + subsidy_received amounts.
    - The owner's tez balance is increased by the proceeds_received amount.
    - The contract's ctez balance is decreased by the self_received + subsidy_received amounts.
    - The contract's tez balance is decreased by the proceeds_received amount.
  Errors: 
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
    - "INSUFFICIENT_LIQUIDITY": Thrown if the amount of owner liquidity is less than the liquidity_redeemed specified.
    - "INSUFFICIENT_SELF_RECEIVED": Thrown if the self_received amount is less than the min_self_received specified.
    - "INSUFFICIENT_PROCEEDS_RECEIVED": Thrown if the proceeds_received amount is less than the min_proceeds_received specified.
    - "INSUFFICIENT_SUBSIDY_RECEIVED": Thrown if the subsidy_received amount is less than the min_subsidy_received specified.
    - "DEADLINE_HAS_PASSED": Thrown if the current time exceeds the deadline.
  Return: 
    - Minting operations for subsidies in Ctez fa12.
    - ops: transfer operations for self tokens (ctez), proceeds (tez) and subsidy (ctez) from the contract to the receiver specified in the parameters.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated ctez dex state and liquidity owner state.
*)
[@entry]
let remove_ctez_liquidity 
    (p : Half_dex.remove_liquidity) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let { dex = sell_ctez; ops; amounts; } = Half_dex.remove_liquidity s.sell_ctez s.context sell_ctez_env False p in
  let (ops, s) = append_remove_liquidity_event amounts True s ops in
  List.append house_ops ops, { s with sell_ctez }


let append_collect_from_liquidity_event 
    (amounts : Half_dex.collect_proceeds_and_subsidy_amounts)
    (is_sell_ctez_dex : bool)
    (s : storage)
    (ops : operation list)
    : result =
  let id = s.last_event_id + 1n in
  let { proceeds_redeemed; subsidy_redeemed; } = amounts in
  let event_params: Events.collect_from_liquidity = {
    id;
    is_sell_ctez_dex;
    proceeds_redeemed;
    subsidy_redeemed;
  } in
  let ops = Events.create_collect_from_liquidity_event_op event_params :: ops in
  let s = { s with last_event_id = id } in
  ops, s

(**
  Collects proceeds and subsidy from tez dex.
  Parameters:
    - to: The address to which the proceeds and subsidy will be sent.
  Pre-conditions:
    - The transaction must not contain any tez.
  Post-conditions:
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The proceeds (ctez) and subsidy (ctez) are transferred to the address specified in the parameter.
  Errors:
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
  Return:
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - ops: transfer operations proceeds (ctez) and subsidy (ctez) from the contract to the receiver specified in the parameters.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated selling tez dex state and liquidity owner state.
*)
[@entry]
let collect_from_tez_liquidity
    (p : Half_dex.collect_proceeds_and_subsidy) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let { dex = sell_tez; ops; amounts; } = Half_dex.collect_proceeds_and_subsidy s.sell_tez s.context sell_tez_env p in
  let (ops, s) = append_collect_from_liquidity_event amounts False s ops in
  List.append house_ops ops, { s with sell_tez }

(**
  Collects proceeds and subsidy from ctez dex.
  Parameters:
    - to: The address to which the proceeds and subsidy will be sent.
  Pre-conditions:
    - The transaction must not contain any tez.
  Post-conditions:
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The proceeds (tez) and subsidy (ctez) are transferred to the address specified in the parameter.
  Errors:
    - "TEZ_IN_TRANSACTION_DISALLOWED": Thrown if the transaction contains tez.
  Return:
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - ops: transfer operations proceeds (tez) and subsidy (ctez) from the contract to the receiver specified in the parameters.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated selling tez dex state and liquidity owner state.
*)
[@entry]
let collect_from_ctez_liquidity 
    (p : Half_dex.collect_proceeds_and_subsidy) 
    (s : storage) 
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let { dex = sell_ctez; ops; amounts; } = Half_dex.collect_proceeds_and_subsidy s.sell_ctez s.context sell_ctez_env p in
  let (ops, s) = append_collect_from_liquidity_event amounts True s ops in
  List.append house_ops ops, { s with sell_ctez }

(** 
  Swaps tez to ctez using the tez dex.
  Parameters:
    - to_: The address that will receive the ctez.
    - min_ctez_bought: The minimum amount of ctez that must be received.
    - deadline: The deadline for the swap.
  Pre-conditions: 
    - The current time must be less than or equal to the deadline.
    - The received amounts should be greater than or equal to the min_ctez_bought.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The tez dex state is updated with the new liquidity state.
    - The amount of tez sent in the transaction is transferred from the sender to the contract.
    - The calculated amount of ctez is transferred from the contract to the receiver.
  Errors: 
    - "DEADLINE_HAS_PASSED": Thrown if the current time exceeds the deadline.
    - "INSUFFICIENT_TOKENS_LIQUIDITY": Thrown if the received amount is greater then the dex self tokens reserves.
    - "INSUFFICIENT_TOKENS_BOUGHT": Thrown if the received amount is less than the min_ctez_bought.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - ops: transfer operation for ctez token from the contract to the receiver specified in the parameters.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated tez dex state.
*)
[@entry]
let tez_to_ctez
    ({to_; min_ctez_bought; deadline} : tez_to_ctez)
    (s : storage)
    : result =
  let house_ops, s = do_housekeeping s in
  let p : Half_dex.swap = { to_ ; deadline; proceeds_amount = tez_to_nat (Tezos.get_amount ()); min_self = min_ctez_bought } in
  let (ops, sell_ctez) = Half_dex.swap s.sell_ctez s.context sell_ctez_env p in
  List.append house_ops ops, { s with sell_ctez }

(** 
  Swaps ctez to tez using the ctez dex.
  Parameters:
    - to_: The address that will receive the ctez.
    - ctez_sold: The amount of ctez that will be sold.
    - min_tez_bought: The minimum amount of tez that must be received.
    - deadline: The deadline for the swap.
  Pre-conditions: 
    - The current time must be less than or equal to the deadline.
    - The received amounts should be greater than or equal to the min_tez_bought.
  Post-conditions: 
    - Housekeeping: recalculates target, drift, ctez outstanding (subsidies).
    - The ctez dex state is updated with the new liquidity state.
    - The amount of ctez specified in the ctez_sold is transferred from the sender to the contract.
    - The calculated amount of tez is transferred from the contract to the receiver.
  Errors: 
    - "DEADLINE_HAS_PASSED": Thrown if the current time exceeds the deadline.
    - "INSUFFICIENT_TOKENS_LIQUIDITY": Thrown if the received amount is greater then the dex self tokens reserves.
    - "INSUFFICIENT_TOKENS_BOUGHT": Thrown if the received amount is less than the min_tez_bought.
  Return: 
    - house_ops: Minting operations for subsidies in Ctez fa12.
    - ops: 
      * transfer operation for ctez token from the sender to the contract.
      * transfer operation for tez token from the contract to the receiver specified in the parameters.
    - updated storage with 
      * updated target, drift, ctez outstanding (housekeeping).
      * updated ctez dex state.
*)
[@entry]
let ctez_to_tez
    ({to_; ctez_sold; min_tez_bought; deadline} : ctez_to_tez)
    (s : storage)
    : result =
  let house_ops, s = do_housekeeping s in
  let () = assert_no_tez_in_transaction () in
  let p : Half_dex.swap = { to_ ; deadline; proceeds_amount = ctez_sold; min_self = min_tez_bought } in
  let (ops, sell_tez) = Half_dex.swap s.sell_tez s.context sell_tez_env p in
  let transfer_ctez_op = Context.transfer_ctez s.context (Tezos.get_sender ()) (Tezos.get_self_address ()) ctez_sold in
  let ops = transfer_ctez_op :: ops in 
  List.append house_ops ops, { s with sell_tez }

(* Views *)

let get_half_dex_state (dex: Half_dex.t) = 
  {
    total_liquidity_shares = dex.total_liquidity_shares;
    self_reserves = dex.self_reserves;
    proceeds_debts = dex.proceeds_debts;
    proceeds_reserves = dex.proceeds_reserves;
    subsidy_debts = dex.subsidy_debts;
    subsidy_reserves = dex.subsidy_reserves;
    fee_index = dex.fee_index;
  }

(** 
  Returns the actual state of the contract storage with applied housekeeping.
  (recalculates target, drift, ctez outstanding (subsidies) and fee indexes in dexes)

  Return:
    - The current state of the contract
*)
[@view]
let get_current_state () (s : storage) = 
  let _, s = get_actual_state s in
  {
    last_update = s.last_update;
    context = s.context;
    sell_ctez = get_half_dex_state s.sell_ctez;
    sell_tez = get_half_dex_state s.sell_tez;
  }

(**
  Returns the actual state of the oven with applied housekeeping and recalculated actual outstanding ctez.
  (due to lazy calculations, the oven state stored in the storage may be outdated; 
  use this view to get the current state of the oven, including applied fees to the outstanding ctez, as of the current time)
  Parameters:
    - handle: The unique identifier of the oven
  Return:
    - The current state of the oven
*)
[@view]
let get_oven_state (handle : Oven.handle) (s : storage) : oven =
  let _, s = get_actual_state s in
  get_oven handle s


(**
  Calculates the number of self tokens received in exchange for a given amount of proceeds.
  Parameters:
    - is_sell_ctez_dex: Whether the dex is selling ctez dex or selling tez dex
    - proceeds_amount: The amount of proceeds that will be bought by the dex
  Return:
    - The number of self tokens that will be sold by the dex
*)
[@view]
let calc_tokens_to_sell
    ({ is_sell_ctez_dex ; proceeds_amount } : calc_tokens_to_sell) 
    (s : storage) 
    : nat =
  let _, s = get_actual_state s in
  let dex, env = if is_sell_ctez_dex 
    then (s.sell_ctez, sell_ctez_env) 
    else (s.sell_tez, sell_tez_env) in
  Half_dex.Curve.swap_amount dex s.context env proceeds_amount
