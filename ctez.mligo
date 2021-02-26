(*
 Order of deployment
 1. Deploy the oven management contract (this contract)
 2. Deploy the fa12 address for the ctez contract, setting the oven management address as admin
 3. Deploy the CFMM, hard coding the oven management contract address as consumer
 4. Deploy the FA12 for the LQT specifying the CFMM as admin
 5. Manually set the LQT FA12 address in the CFMM
 6. Manually set the ctez fa12 address and the cfmm address in the oven management contract
*)

type set_addresses = [@layout:comb] {cfmm_address : address ; ctez_fa12_address : address }
type liquidate = [@layout:comb] { oven_owner : address ; quantity : nat ; [@annot:to] to_ : unit contract }
type withdraw = [@layout:comb] { amount : tez ;  [@annot:to] to_ : unit contract }


type parameter =
  | Create of (key_hash option)
  | Deposit
  | Withdraw of withdraw
  | Liquidate of liquidate
  | Delegate of (key_hash option)
  | Mint_or_burn of int
  | Cfmm_price of tez * nat
  | Set_addresses of set_addresses
  | Get_target of nat contract

type oven = {tez_balance : tez ; ctez_outstanding : nat ; address : address}

type storage = {
  ovens : (address, oven) big_map ;
  target : nat ;
  drift : int ;
  last_drift_update : timestamp ;
  ctez_fa12_address : address option; (* address of the fa12 contract managing the ctez token *)
  cfmm_address : address option; (* address of the cfmm providing the price feed *)
}
type result = (operation list) * storage

(* Types for oven *)
type oven_parameter =
  | Oven_delegate of (key_hash option)
  | Oven_deposit
  | Oven_withdraw of tez * (unit contract)
type oven_storage = { admin : address (* vault admin contract *) }
type oven_result = (operation list) * oven_storage
(* End of oven types *)


[@inline] let error_OVEN_ALREADY_EXISTS = 0n
[@inline] let error_OVEN_CAN_ONLY_BE_CALLED_FROM_MAIN_CONTRACT = 1n
[@inline] let error_CTEZ_FA12_ADDRESS_ALREADY_SET = 2n 
[@inline] let error_CFMM_ADDRESS_ALREADY_SET = 3n
[@inline] let error_OVEN_DOESNT_EXIST= 4n
[@inline] let error_OVEN_MISSING_WITHDRAW_ENTRYPOINT = 5n
[@inline] let error_OVEN_MISSING_DEPOSIT_ENTRYPOINT = 6n
[@inline] let error_OVEN_MISSING_DELEGATE_ENTRYPOINT = 7n
[@inline] let error_EXCESSIVE_TEZ_WITHDRAWAL = 8n
[@inline] let error_CTEZ_FA12_CONTRACT_MISSING_MINT_OR_BURN_ENTRYPOINT = 9n
[@inline] let error_CANNOT_BURN_MORE_THAN_OUTSTANDING_AMOUNT_OF_CTEZ = 10n
[@inline] let error_OVEN_NOT_UNDERCOLLATERALIZED = 11n
[@inline] let error_EXCESSIVE_CTEZ_MINTING = 12n
[@inline] let error_CALLER_MUST_BE_CFMM = 13n
[@inline] let error_CTEZ_FA12_ADDRESS_NOT_SET = 14n 
[@inline] let error_CFMM_ADDRESS_NOT_SET = 15n

  
let create (s : storage) (delegate : key_hash option) : result = 
  if Big_map.mem Tezos.sender s.ovens then
    (failwith error_OVEN_ALREADY_EXISTS : result)
  else
    let origination : operation * address  = Tezos.create_contract 
        (* Contract code for an oven *)
        (fun (p , s : oven_parameter * oven_storage) -> (
             if Tezos.sender <> s.admin then
               (* error_OVEN_CAN_ONLY_BE_CALLED_FROM_MAIN_CONTRACT *)
               (failwith 1n : oven_result)
             else 
               (match p with
                | Oven_delegate ko -> ([Tezos.set_delegate ko], s)
                | Oven_deposit -> (([] : operation list), s)
                | Oven_withdraw x -> ([Tezos.transaction unit x.0 x.1], s))))
        (* End of contract code for an oven *)
        delegate
        Tezos.amount
        { admin = Tezos.self_address } in
    let oven = {tez_balance = Tezos.amount ; ctez_outstanding = 0n ; address = origination.1}  in
    let ovens = Big_map.update Tezos.sender (Some oven) s.ovens in
    ([origination.0], {s with ovens = ovens})

let set_addresses (s : storage) (addresses : set_addresses) : result =
  let s = match s.ctez_fa12_address with
          | None -> {s with ctez_fa12_address = (Some addresses.ctez_fa12_address);}
          | Some x -> (failwith error_CTEZ_FA12_ADDRESS_ALREADY_SET : storage) in
  let s = match s.cfmm_address with
          | None -> {s with cfmm_address = (Some addresses.cfmm_address);}
          | Some x -> (failwith error_CTEZ_FA12_ADDRESS_ALREADY_SET : storage) in
  ([] : operation list), s

let get_oven (oven_address : address) (s : storage) : oven = 
  match Big_map.find_opt oven_address s.ovens with
  | None -> (failwith error_OVEN_DOESNT_EXIST : oven)
  | Some o -> o

let is_under_collateralized (oven : oven) (target : nat): bool = 
  (15n * oven.tez_balance) < (Bitwise.shift_right (oven.ctez_outstanding * target) 44n) * 1mutez

let deposit (s : storage) : result =
  let oven : oven = get_oven Tezos.sender s in    
  let oven = {oven with tez_balance = oven.tez_balance + Tezos.amount} in
  let ovens = Big_map.update Tezos.sender (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  let oven_contract = 
    match (Tezos.get_entrypoint_opt "%oven_deposit" oven.address : unit contract option) with
    | None -> (failwith error_OVEN_MISSING_DEPOSIT_ENTRYPOINT : unit contract)
    | Some c -> c
  in ([Tezos.transaction unit Tezos.amount oven_contract], s)

let get_oven_withdraw (oven_address : address) : (tez * (unit contract)) contract = 
  match (Tezos.get_entrypoint_opt "%oven_withdraw" oven_address : (tez * (unit contract)) contract option) with
  | None -> (failwith error_OVEN_MISSING_WITHDRAW_ENTRYPOINT : (tez * (unit contract)) contract)
  | Some c -> c

let get_oven_delegate (oven_address : address) : (key_hash option) contract =
  match (Tezos.get_entrypoint_opt "%oven_delegate" oven_address : (key_hash option) contract option) with
  | None -> (failwith error_OVEN_MISSING_DELEGATE_ENTRYPOINT : (key_hash option) contract)
  | Some c -> c

let withdraw (s : storage) (p : withdraw)   : result =
  let oven : oven = get_oven Tezos.sender s in
  let oven_contract = get_oven_withdraw oven.address in

  (* Check for undercollateralization *)
  let new_balance = oven.tez_balance - p.amount in    
  let oven = {oven with tez_balance = new_balance} in
  let ovens = Big_map.update Tezos.sender (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  if is_under_collateralized oven s.target then
    (failwith error_EXCESSIVE_TEZ_WITHDRAWAL : result)
  else
    ([Tezos.transaction (p.amount, p.to_) 0mutez oven_contract], s)

let delegate (s : storage) (d : key_hash option) : result = 
  let oven : oven = get_oven Tezos.sender s in
  let oven_contract = get_oven_delegate oven.address in
  ([Tezos.transaction d 0mutez oven_contract], s)

let get_ctez_mint_or_burn (fa12_address_opt : address option) : (int * address) contract =
  let fa12_address = match fa12_address_opt with
                     | None -> (failwith error_CTEZ_FA12_ADDRESS_NOT_SET: address)
                     | Some x -> x in
  match (Tezos.get_entrypoint_opt  "%mint_or_burn"  fa12_address : ((int * address) contract) option) with
  | None -> (failwith error_CTEZ_FA12_CONTRACT_MISSING_MINT_OR_BURN_ENTRYPOINT : (int * address) contract)
  | Some c -> c 

(* liquidate the oven by burning "quantity" ctez *)
let liquidate (s: storage) (p : liquidate) : result  =
  let oven : oven = get_oven p.oven_owner s in
  if is_under_collateralized oven s.target then            
    let remaining_ctez = match Michelson.is_nat (oven.ctez_outstanding - p.quantity) with
      | None -> (failwith error_CANNOT_BURN_MORE_THAN_OUTSTANDING_AMOUNT_OF_CTEZ : nat)
      | Some n -> n  in        
    let extracted_balance = (Bitwise.shift_right (p.quantity * s.target) 44n) * 1mutez / 15n in (* 44 is 48 - log2(16) *)
    let new_balance = oven.tez_balance - extracted_balance in
    let oven = {oven with ctez_outstanding = remaining_ctez ; tez_balance = new_balance} in
    let ovens = Big_map.update p.oven_owner (Some oven) s.ovens in
    let s = {s with ovens = ovens} in
    let oven_contract = get_oven_withdraw oven.address in
    let op_take_collateral = Tezos.transaction (extracted_balance, p.to_) 0mutez oven_contract in
    let ctez_mint_or_burn = get_ctez_mint_or_burn s.ctez_fa12_address in 
    let op_burn_ctez = Tezos.transaction (-p.quantity, Tezos.sender) 0mutez ctez_mint_or_burn in 
    ([op_burn_ctez ; op_take_collateral], s)
  else   
    (failwith error_OVEN_NOT_UNDERCOLLATERALIZED : result)

let mint_or_burn (s : storage) (quantity: int) : result = 
  let oven : oven = get_oven Tezos.sender s in 
  let ctez_outstanding = match Michelson.is_nat (oven.ctez_outstanding + quantity) with
    | None -> (failwith error_CANNOT_BURN_MORE_THAN_OUTSTANDING_AMOUNT_OF_CTEZ : nat)
    | Some n -> n in
  let oven = {oven with ctez_outstanding = ctez_outstanding} in
  let ovens = Big_map.update Tezos.sender (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  if is_under_collateralized oven s.target then
    (failwith  error_EXCESSIVE_CTEZ_MINTING : result)
    (* mint or burn quantity in the fa1.2 of ctez *)
  else
    let ctez_mint_or_burn = get_ctez_mint_or_burn s.ctez_fa12_address in 
    ([Tezos.transaction (quantity, Tezos.sender) 0mutez ctez_mint_or_burn], s)

let get_target (storage : storage) (callback : nat contract) : result =
  ([Tezos.transaction storage.target 0mutez callback], storage)

(* todo: restore when ligo interpret is fixed
   let cfmm_price (storage : storage) (tez : tez) (token : nat) : result =      *)
let cfmm_price (storage, tez, token : storage * tez * nat) : result =
  let cfmm_address = match storage.cfmm_address with
                     | None -> (failwith error_CFMM_ADDRESS_NOT_SET: address)
                     | Some x -> x in
  if Tezos.sender <> cfmm_address then
    (failwith error_CALLER_MUST_BE_CFMM : result)
  else
    let delta = abs (Tezos.now - storage.last_drift_update) in
    let target = storage.target in 
    let d_target = Bitwise.shift_right (target * (abs storage.drift) * delta) 48n in
    (* We assume that target - d_target never happens for economic reasons.
       Concretely, even drift were as low as -50% annualized, it would take not
       updating the target for 1.4 years for a negative number to occur *)
    let target  = if storage.drift < 0  then abs (target - d_target) else target + d_target in
    let drift =         
      if (Bitwise.shift_left (tez / (1mutez)) 54n) > 65n * target * token  then  (* 54 is 48 + log2(64) *)
        storage.drift - delta
        (* This is not homegeneous, but setting the constant delta is multiplied with
           to 1.0 magically happens to be reasonable. Why?
           Because (24 * 3600 / 2^48) * 365.25*24*3600 ~ 0.97%.
           This means that the annualized drift changes by roughly one percentage point
           for each day over or under the target by more than 1/64th.
        *)          
      else if (Bitwise.shift_left (tez / 1mutez) 54n) < 63n * target * token then
        storage.drift + delta 
      else 
        storage.drift in
    (([] : operation list), {storage with drift = drift ; last_drift_update = Tezos.now ; target = target})

let main (p, s : parameter * storage) : result = 
  match p with    
  | Withdraw w -> (withdraw s w : result)
  | Deposit -> (deposit s : result)
  | Create d -> (create s d : result)
  | Delegate d -> (delegate s d : result)
  | Liquidate l -> (liquidate s l : result)
  | Mint_or_burn xs -> (mint_or_burn s xs : result)
  | Cfmm_price xs -> (cfmm_price (s, xs.0, xs.1) : result)
  | Set_addresses xs -> (set_addresses s xs : result)
  | Get_target t -> (get_target s t : result)

