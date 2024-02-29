type add_tez_liquidity = 
[@layout:comb]
{
    owner : address ; (* address that will own the liqudity *)
    minLiquidity : nat ; (* minimum amount of liquidity to add *)
    deadline : timestamp ; (* deadline for the transaction *)
}

type add_ctez_liquidity = 
[@layout:comb]
{
    owner : address ; (* address that will own the liqudity *)
    minLiquidity : nat ; (* minimum amount of liquidity to add *)
    deadline : timestamp ; (* deadline for the transaction *)
    ctezDeposited : nat ; (* amount of ctez to deposit *)
}

type remove_tez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to receive to *)
    lpt : nat ; (* amount of liquidity to remove *)
    minTezReceived : nat ; (* minimum amount of tez to receive *)
    minCtezReceived : nat ; (* minimum amount of ctez to receive *)
    minSubsidyReceived : nat ; (* minimum amount of ctez subsidy to receive *)
    deadline : timestamp ; (* deadline for the transaction *)
}

type remove_ctez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to receive to *)
    lpt : nat ; (* amount of liquidity to remove *)
    minTezReceived : nat ; (* minimum amount of tez to receive *)
    minCtezReceived : nat ; (* minimum amount of ctez to receive *)
    minSubsidyReceived : nat ; (* minimum amount of ctez subsidy to receive *)
    deadline : timestamp ; (* deadline for the transaction *)
}

type tez_to_ctez = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address that will own the ctez *)
    refund : address ; (* address to refund extra tez to *)
    deadline : timestamp ; (* deadline for the transaction *)
    ctezBought : nat ; (* amount of ctez to buy *)
    maxTezSold : tez ; (* maximum amount of tez to sell *)
}

type ctez_to_tez = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address that will own the tez *)
    deadline : timestamp ; (* deadline for the transaction *)
    minTezBought : nat ; (* minimum amount of tez to buy *)    
    ctezSold : nat ; (* amount of ctez to sell *)
}

type withdraw_for_tez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to withdraw to *)
}

type withdraw_for_ctez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to withdraw to, note that here you receive both ctez and tez 
    because ctez is received as part of the subsidy *)
}

type liquidity_owner = 
[@layout:comb]
{
    lpt : nat ; (* LP token amount *)
    owed : nat ; (* amount of the proceeds token owed to the contract *)
    subsidy_owed : nat ; (* amount of ctez subsidy owed to the contract *)
}


type half_dex = 
[@layout:comb]
{
    liquidity_owners : (address, liquidity_owner) big_map ; (* map of liquidity owners *)
    total_lpt : nat  ; (* total amount of liquidity tokens *)
    total_liquidity : nat ; (* total amount of liquidity *)
    total_proceeds : nat ; (* total amount accumulated from proceeds *)
    total_subsidy : nat ; (* total amount accumulated from subsidy *)
}

type storage = 
[@layout:comb]
{
    sell_ctez : half_dex ;
    sell_tez  : half_dex ;
    target : nat ; (* target / 2^48 is the target price of ctez in tez *) (* todo, logic for update *)
    q : nat ; (* Q is the desired quantity of ctez in the ctez half dex,
     floor(Q * target) is the desired quantity of tez in the tez half dex *)
     liquidity_dex_address : address ; (* address of the liquidity dex *)
      ctez_token_contract : address ; (* address of the ctez token contract *)
}

[@inline]
let ceildiv (numerator : nat) (denominator : nat) : nat = abs ((- numerator) / (int denominator))


[@inline]
let redeem_amount (x : nat) (reserve : nat) (total : nat) : nat = 
  // The redeem rate is defined as 
  //  RX_i(t_0, t_1) := r_i / total(t_0, t_1)
  // The redeem amount is defined as
  //    v = x / RX_i(t_0, t_1) = (x * total(t_0, t_1)) / reserve
  (x * total) / reserve


[@entry]
let add_ctez_liquidity (param : add_ctez_liquidity) (s : storage) : storage * operation list =
  let d_lpt = redeem_amount param.ctezDeposited s.sell_ctez.total_liquidity s.sell_ctez.total_lpt in
  let () = assert_with_error (d_lpt >= param.minLiquidity) "transaction would create insufficient liquidity" in 
  let () = assert_with_error (Tezos.get_now () <= param.deadline) "deadline has passed" in
  // lpt is going to be lpt + d_lpt
  // ctez is going to be ctez + d_ctez
  // if the owner already has liquidity, we need to update the owed amount
  // otherwise we need to create a new liquidity owner
  let liquidity_owner = 
    Option.value 
      { lpt = 0n ; owed = 0n ; subsidy_owed = 0n} 
      (Big_map.find_opt param.owner s.sell_ctez.liquidity_owners) 
  in
  let d_tez = ceildiv (s.sell_ctez.total_proceeds * d_lpt) s.sell_ctez.total_lpt in    
  let d_subsidy_owed = ceildiv (s.sell_ctez.total_subsidy * d_lpt) s.sell_ctez.total_lpt in
  // Update liquidity owner
  let liquidity_owner = { liquidity_owner with
      lpt  = liquidity_owner.lpt + d_lpt ;
      owed = liquidity_owner.owed + d_tez ;
      subsidy_owed = liquidity_owner.subsidy_owed + d_subsidy_owed } in
  let liquidity_owners = Big_map.update param.owner (Some liquidity_owner) s.sell_ctez.liquidity_owners in

  let sell_ctez = {s.sell_ctez with
      liquidity_owners = liquidity_owners ;
      total_lpt = s.sell_ctez.total_lpt + d_lpt ;
      total_liquidity = s.sell_ctez.total_liquidity + param.ctezDeposited ;
      } in

  let receive_ctez = Tezos.transaction (param.owner, (s.liquidity_dex_address, params.ctezDeposited)) 0mutez s.ctez_token_contract in
  ({s with sell_ctez = half_dex}, [receive_ctez])
    
[@entry]
let remove_ctez_liquidity (param : remove_ctez_liquidity) (s : storage) : storage * operation list = 
  let () = assert_with_error (Tezos.get_now () <= param.deadline) "deadline has passed" in
  let ctez_removed = (param.lpt * s.sell_ctez.total_liquidity) / s.sell_ctez.total_lpt in
  let tez_removed = (param.lpt * s.sell_ctez.total_proceeds) / s.sell_ctez.total_lpt in
  let subsidy_removed = (param.lpt * s.sell_ctez.total_subsidy) / s.sell_ctez.total_lpt in
  let owner = Tezos.get_sender () in
  let liquidity_owner = Option.unopt_with_error (Big_map.find_opt owner s.sell_ctez.liquidity_owners) "no liquidity owner" in
  let () = assert_with_error (liquidity_owner.lpt >= param.lpt) "insufficient liquidity" in
  let () = assert_with_error (ctez_removed >= param.minCtezReceived) "insufficient ctez would be received" in

  (* compute the amount of tez to receive after netting the owed amount *)
  let tez_to_receive = tez_removed - liquidity_owner.owed in
  let () = assert_with_error (tez_to_receive >= int param.minTezReceived) "insufficient tez would be received" in
  let (owed, tez_to_receive) =
      if tez_to_receive < 0 then                    
          (abs (liquidity_owner.owed - tez_removed), 0n)
      else
          (0n, abs tez_to_receive)
  in
  (* computed the amount of subsidy to recieve after netting the owed subsidy amount *)


  let subsidy_to_receive = subsidy_removed - liquidity_owner.subsidy_owed in
  let () = assert_with_error (subsidy_to_receive >= int param.minSubsidyReceived) "insufficient subsidy would be received" in
  let (subsidy_owed, subsidy_to_receive) =
      if subsidy_to_receive < 0 then
          (abs (liquidity_owner.subsidy_owed - subsidy_removed), 0n)
      else
          (0n, abs subsidy_to_receive)
  in

  let liquidity_ower = { liquidity_owner with
                        lpt = abs (liquidity_owner.lpt - param.lpt) ;
                        owed = owed ;
                        subsidy_owed = subsidy_owed } in
  let liquidity_owners = Big_map.update owner (Some liquidity_owner) s.sell_ctez.liquidity_owners in

  let sell_ctez = {s.sell_ctez with
      liquidity_owners = liquidity_owners ;
      total_lpt = abs (s.sell_ctez.total_lpt - param.lpt) ;
      total_liquidity = abs (s.sell_ctez.total_liquidity - ctez_removed) ;
      total_proceeds = abs (s.sell_ctez.total_proceeds - tez_removed) ;
      total_subsidy = abs (s.sell_ctez.total_subsidy - subsidy_removed) ;
  } in
  let receive_ctez = Tezos.transaction (param.to_, (s.ctez_token_contract, ctez_removed)) 0mutez s.liquidity_dex_address in
  let receive_subsidy = Tezos.transaction (param.to_, (s.ctez_token_contract, subsidy_to_receive)) 0mutez s.liquidity_dex_address in
  let receive_tez = Tezos.transaction () (tez_to_receive * 1mutez) param.to_ in
  ({s with sell_ctez = sell_ctez}, [receive_ctez; receive_subsidy; receive_tez])


let newton_step (q : int) (t : int) (_Q : int) (dq : int): int =
 (*
    (3 dq⁴ + 6 dq² (q - Q)² + 8 dq³ (-q + Q) + 80 Q³ t) / (4 ((dq - q)³ + 3 (dq - q)² Q + 3 (dq - q) Q² + 21 Q³))
    todo, check that implementation below is correct
 *)    
    let q_m_Q = q - _Q in
    let dq_m_q = dq - q in
    let dq_m_q_sq = dq_m_q * dq_m_q in
    let dq_m_q_cu = dq_m_q_sq * dq_m_q in
    let _Q_sq = _Q * _Q in
    let _Q_cu = _Q_sq * _Q in
      
    let num = 3 * dq * dq * dq * dq + 6 * dq * dq * q_m_Q * q_m_Q + 8 * dq * dq * dq * (-q_m_Q) + 80 * _Q_cu * t in
    let denom = 4 * (dq_m_q_cu + 3 * dq_m_q_sq * _Q + 3 * dq_m_q * _Q_sq + 21 * _Q_cu) in
      
    num / denom

let invert (q : int) (t : int) (_Q : int) : int =
    (* note that the price is generally very nearly linear, after all the worth marginal price is 1.05, so Newton
    converges stupidly fast *)
    let dq = newton_step q t _Q t in 
    let dq = newton_step q t _Q dq in
    let dq = newton_step q t _Q dq in
    dq



[@entry]
let tez_to_ctez (param : tez_to_ctez) (s : storage) : storage * operation list = 
  let () = assert_with_error (Tezos.get_now () <= param.deadline) "deadline has passed" in
  let tez_
 (* The amount of tez that will be bought is calculated by integrating a polynomial which is a function of the fraction u purchased over q
  * the polynomial, representing the marginal price is given as (21 - 3 * u + 3 u^2 - u^3) / 20 
  * again, u is the quantity of ctez purchased over q which represents this characteristic quantity of ctez in the ctez half dex.&&
  * the integral of this polynomial between u = 0 and u = x / q (where x will be ctez_to_sell) is is given as
  *  (21 * u - 3 * u^2 / 2 + u^3 - u^4 / 4) / 20
  * or (cts(cts(cts^2-3q^2)+42  q^3))/(40q^4) *) 
  let cts = ctez_to_sell in let q = s.q in
  let q2 = q * q in 
  let d_tez = (cts * (cts * (cts * cts - 3 * q2) + 42 * q * q2)) / (40 * q2 * q2) in    
    
  
(* withdraw: you can withdraw x so long as x + owed < lpt * total_proceeds / total_lpt, after which owed := owed + x *)
