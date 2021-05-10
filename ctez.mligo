(*
 Order of deployment
 1. Deploy the oven management contract (this contract)
 2. Deploy the fa12 address for the ctez contract, setting the oven management address as admin
 3. Deploy the CFMM, hard coding the oven management contract address as consumer
 4. Deploy the FA12 for the LQT specifying the CFMM as admin
 5. Manually set the LQT FA12 address in the CFMM
 6. Manually set the ctez fa12 address and the cfmm address in the oven management contract
*)

(* Types for oven *)
#include "oven_types.mligo"
(* End of oven types *)


type set_addresses = [@layout:comb] {cfmm_address : address ; ctez_fa12_address : address }
type liquidate = [@layout:comb] { handle : oven_handle ; quantity : nat ; [@annot:to] to_ : unit contract }
type withdraw = [@layout:comb] { id : nat ; amount : tez ;  [@annot:to] to_ : unit contract }
type create = [@layout:comb] {id : nat ; delegate : key_hash option ; depositors : depositors }
type mint_or_burn = [@layout:comb] {id : nat ; quantity : int}

type parameter =
  | Create of create
  | Withdraw of withdraw
  | Liquidate of liquidate
  | Register_deposit of register_deposit
  | Mint_or_burn of mint_or_burn
  | Cfmm_price of nat * nat
  | Set_addresses of set_addresses
  | Get_target of nat contract

type oven = {tez_balance : tez ; ctez_outstanding : nat ; address : address}

type storage = {
  ovens : (oven_handle, oven) big_map ;
  target : nat ;
  drift : int ;
  last_drift_update : timestamp ;
  ctez_fa12_address : address ; (* address of the fa12 contract managing the ctez token *)
  cfmm_address : address ; (* address of the cfmm providing the price feed *)
}
type result = (operation list) * storage


[@inline] let error_OVEN_ALREADY_EXISTS = 0n
[@inline] let error_INVALID_CALLER_FOR_OVEN_OWNER = 1n
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


#include "oven.mligo"

let create (s : storage) (create : create) : result =
  let handle = { id = create.id ; owner = Tezos.sender } in
  if Big_map.mem handle s.ovens then
    (failwith error_OVEN_ALREADY_EXISTS : result)
  else
    let (origination_op, oven_address) : operation * address =
    create_oven create.delegate Tezos.amount { admin = Tezos.self_address ; handle = handle ; depositors = create.depositors } in
    let oven = {tez_balance = Tezos.amount ; ctez_outstanding = 0n ; address = oven_address}  in
    let ovens = Big_map.update handle (Some oven) s.ovens in
    ([origination_op], {s with ovens = ovens})

let set_addresses (s : storage) (addresses : set_addresses) : result =
  if s.ctez_fa12_address <> ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
    (failwith error_CTEZ_FA12_ADDRESS_ALREADY_SET : result)
  else if  s.cfmm_address <> ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
    (failwith error_CFMM_ADDRESS_ALREADY_SET : result)
  else
    (([] : operation list), {s with ctez_fa12_address = addresses.ctez_fa12_address ; cfmm_address = addresses.cfmm_address})

let get_oven (handle : oven_handle) (s : storage) : oven =
  match Big_map.find_opt handle s.ovens with
  | None -> (failwith error_OVEN_DOESNT_EXIST : oven)
  | Some o -> o

let is_under_collateralized (oven : oven) (target : nat): bool =
  (15n * oven.tez_balance) < (Bitwise.shift_right (oven.ctez_outstanding * target) 44n) * 1mutez

let get_oven_withdraw (oven_address : address) : (tez * (unit contract)) contract =
  match (Tezos.get_entrypoint_opt "%oven_withdraw" oven_address : (tez * (unit contract)) contract option) with
  | None -> (failwith error_OVEN_MISSING_WITHDRAW_ENTRYPOINT : (tez * (unit contract)) contract)
  | Some c -> c

let get_oven_delegate (oven_address : address) : (key_hash option) contract =
  match (Tezos.get_entrypoint_opt "%oven_delegate" oven_address : (key_hash option) contract option) with
  | None -> (failwith error_OVEN_MISSING_DELEGATE_ENTRYPOINT : (key_hash option) contract)
  | Some c -> c

let withdraw (s : storage) (p : withdraw)   : result =
  let handle = {id = p.id ; owner = Tezos.sender} in
  let oven : oven = get_oven handle s in
  let oven_contract = get_oven_withdraw oven.address in

  (* Check for undercollateralization *)
  let new_balance = oven.tez_balance - p.amount in
  let oven = {oven with tez_balance = new_balance} in
  let ovens = Big_map.update handle (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  if is_under_collateralized oven s.target then
    (failwith error_EXCESSIVE_TEZ_WITHDRAWAL : result)
  else
    ([Tezos.transaction (p.amount, p.to_) 0mutez oven_contract], s)

let register_deposit (s : storage) (p : register_deposit) : result =
    (* First check that the call is legit *)
    let oven = get_oven p.handle s in
    if oven.address <> Tezos.sender then
      (failwith error_INVALID_CALLER_FOR_OVEN_OWNER : result)
    else
      (* register the increased balance *)
      let oven = {oven with tez_balance = oven.tez_balance + p.amount} in
      let ovens = Big_map.update p.handle (Some oven) s.ovens in
      (([] : operation list), {s with ovens = ovens})

let get_ctez_mint_or_burn (fa12_address : address) : (int * address) contract =
  match (Tezos.get_entrypoint_opt  "%mintOrBurn"  fa12_address : ((int * address) contract) option) with
  | None -> (failwith error_CTEZ_FA12_CONTRACT_MISSING_MINT_OR_BURN_ENTRYPOINT : (int * address) contract)
  | Some c -> c

(* liquidate the oven by burning "quantity" ctez *)
let liquidate (s: storage) (p : liquidate) : result  =
  let oven : oven = get_oven p.handle s in
  if is_under_collateralized oven s.target then
    let remaining_ctez = match Michelson.is_nat (oven.ctez_outstanding - p.quantity) with
      | None -> (failwith error_CANNOT_BURN_MORE_THAN_OUTSTANDING_AMOUNT_OF_CTEZ : nat)
      | Some n -> n  in
    (* get 32/31 of the target price, meaning there is a 1/31 penalty for the oven owner for being liquidated *)
    let extracted_balance = (Bitwise.shift_right (p.quantity * s.target) 43n) * 1mutez / 31n in (* 43 is 48 - log2(32) *)
    let new_balance = oven.tez_balance - extracted_balance in
    let oven = {oven with ctez_outstanding = remaining_ctez ; tez_balance = new_balance} in
    let ovens = Big_map.update p.handle (Some oven) s.ovens in
    let s = {s with ovens = ovens} in
    let oven_contract = get_oven_withdraw oven.address in
    let op_take_collateral = Tezos.transaction (extracted_balance, p.to_) 0mutez oven_contract in
    let ctez_mint_or_burn = get_ctez_mint_or_burn s.ctez_fa12_address in
    let op_burn_ctez = Tezos.transaction (-p.quantity, Tezos.sender) 0mutez ctez_mint_or_burn in
    ([op_burn_ctez ; op_take_collateral], s)
  else
    (failwith error_OVEN_NOT_UNDERCOLLATERALIZED : result)

let mint_or_burn (s : storage) (p : mint_or_burn) : result =
  let handle = { id = p.id ; owner = Tezos.sender } in
  let oven : oven = get_oven handle s in
  let ctez_outstanding = match Michelson.is_nat (oven.ctez_outstanding + p.quantity) with
    | None -> (failwith error_CANNOT_BURN_MORE_THAN_OUTSTANDING_AMOUNT_OF_CTEZ : nat)
    | Some n -> n in
  let oven = {oven with ctez_outstanding = ctez_outstanding} in
  let ovens = Big_map.update handle (Some oven) s.ovens in
  let s = {s with ovens = ovens} in
  if is_under_collateralized oven s.target then
    (failwith  error_EXCESSIVE_CTEZ_MINTING : result)
    (* mint or burn quantity in the fa1.2 of ctez *)
  else
    let ctez_mint_or_burn = get_ctez_mint_or_burn s.ctez_fa12_address in
    ([Tezos.transaction (p.quantity, Tezos.sender) 0mutez ctez_mint_or_burn], s)

let get_target (storage : storage) (callback : nat contract) : result =
  ([Tezos.transaction storage.target 0mutez callback], storage)

(* todo: restore when ligo interpret is fixed
   let cfmm_price (storage : storage) (tez : tez) (token : nat) : result =      *)
let cfmm_price (storage, tez, token : storage * nat * nat) : result =
  if Tezos.sender <> storage.cfmm_address then
    (failwith error_CALLER_MUST_BE_CFMM : result)
  else
    let delta = abs (Tezos.now - storage.last_drift_update) in
    let target = storage.target in
    let d_target = Bitwise.shift_right (target * (abs storage.drift) * delta) 48n in
    (* We assume that `target - d_target < 0` never happens for economic reasons.
       Concretely, even drift were as low as -50% annualized, it would take not
       updating the target for 1.4 years for a negative number to occur *)
    let target  = if storage.drift < 0  then abs (target - d_target) else target + d_target in
    (* This is not homegeneous, but setting the constant delta is multiplied with
           to 1.0 magically happens to be reasonable. Why?
           Because (24 * 3600 / 2^48) * 365.25*24*3600 ~ 0.97%.
           This means that the annualized drift changes by roughly one percentage point
           for each day over or under the target by more than 1/64th.
        *)

    let price = (Bitwise.shift_left tez 48n) / token in
    let target_less_price : int = target - price in
    let d_drift =
      let x = Bitwise.shift_left (abs (target_less_price * target_less_price)) 10n in
      let p2 = price * price  in
      if x > p2 then delta else x * delta / p2 in

    let drift =
    if target_less_price > 0 then
      storage.drift + d_drift
    else
      storage.drift - d_drift in

    (([] : operation list), {storage with drift = drift ; last_drift_update = Tezos.now ; target = target})

let main (p, s : parameter * storage) : result =
  match p with
  | Withdraw w -> (withdraw s w : result)
  | Register_deposit r -> (register_deposit s r : result)
  | Create d -> (create s d : result)
  | Liquidate l -> (liquidate s l : result)
  | Mint_or_burn xs -> (mint_or_burn s xs : result)
  | Cfmm_price xs -> (cfmm_price (s, xs.0, xs.1) : result)
  | Set_addresses xs -> (set_addresses s xs : result)
  | Get_target t -> (get_target s t : result)

