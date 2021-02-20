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
    | Mint_or_burn of int
    | Cfmm_price of tez * nat
    | Set_addresses of set_addresses

type oven = {tez_balance : tez ; ctez_outstanding : nat ; address : address}

type storage = {
    ovens : (address, oven) big_map ;
    target : nat ; drift : int ;
    last_drift_update : timestamp ;
    ctez_fa12_address : address ; // address of the fa12 contract managing the ctez token
    cfmm_address : address ; // address of the cfmm providing the price feed
}
type result = (operation list) * storage

//////////////// Types for oven
type oven_parameter =
| Delegate of (key_hash option)
| Oven_deposit
| Oven_withdraw of tez * (unit contract)
type oven_storage = { admin : address (* vault admin contract *) }
type oven_result = (operation list) * oven_storage
//////////////// End of oven types

let create (s : storage) (delegate : key_hash option) : result = 
    if Big_map.mem Tezos.sender s.ovens then
        (failwith "oven already exists" : result)
    else
        let origination : operation * address  = Tezos.create_contract 
            // Contract code for an oven
            (fun (p , s : oven_parameter * oven_storage) -> (
                if Tezos.sender <> s.admin then
                    (failwith "oven can only be called from main contract" : oven_result)
                else 
                (match p with
                    | Delegate ko -> ([Tezos.set_delegate ko], s)
                    | Oven_deposit -> (([] : operation list), s)
                    | Oven_withdraw x -> ([Tezos.transaction unit x.0 x.1], s))))
            // End of contract code for an oven
            delegate
            Tezos.amount
            { admin = Tezos.self_address } in
        let oven = {tez_balance = Tezos.amount ; ctez_outstanding = 0n ; address = origination.1}  in
        let ovens = Big_map.update Tezos.sender (Some oven) s.ovens in
        ([origination.0], {s with ovens = ovens}) 

let set_addresses (s : storage) (addresses : set_addresses) : result = 
    if s.ctez_fa12_address <> ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
        (failwith "ctez fa12 address already set" : result)
    else if  s.cfmm_address <> ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
        (failwith "cfmm address already set" : result)
    else        
        (([] : operation list), {s with ctez_fa12_address = addresses.ctez_fa12_address ; cfmm_address = addresses.cfmm_address})


let get_oven (oven_address : address) (s : storage) : oven = 
    match Big_map.find_opt oven_address s.ovens with
        | None -> (failwith "oven doesn't exist" : oven)
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
        | None -> (failwith "oven address doesn't exist" : unit contract)
        | Some c -> c
    in ([Tezos.transaction unit Tezos.amount oven_contract], s)

let get_oven_withdraw (oven_address : address) : (tez * (unit contract)) contract = 
    match (Tezos.get_entrypoint_opt "%oven_withdraw" oven_address : (tez * (unit contract)) contract option) with
        | None -> (failwith "oven doesn't exist" : (tez * (unit contract)) contract)
        | Some c -> c

let withdraw (s : storage) (p : withdraw)   : result =
    let oven : oven = get_oven Tezos.sender s in
    let oven_contract = get_oven_withdraw oven.address in
        
    // Check for undercollateralization
    let new_balance = oven.tez_balance - p.amount in    
    let oven = {oven with tez_balance = new_balance} in
    let ovens = Big_map.update Tezos.sender (Some oven) s.ovens in
    let s = {s with ovens = ovens} in
    if is_under_collateralized oven s.target then
        (failwith "withdrawal would not leave enough collateral" : result)
    else
        ([Tezos.transaction (p.amount, p.to_) 0mutez oven_contract], s)

let get_ctez_mint_or_burn (fa12_address : address) : (int * address) contract = 
    match (Tezos.get_entrypoint_opt  "%mint_or_burn"  fa12_address : ((int * address) contract) option) with
        | None -> (failwith "cannot get mint or burn entrypoint for ctez fa12 contract" : (int * address) contract)
        | Some c -> c 

// liquidate the oven by burning "quantity" ctez
let liquidate (s: storage) (p : liquidate) : result  =
    let oven : oven = get_oven p.oven_owner s in
    if is_under_collateralized oven s.target then            
        let remaining_ctez = match Michelson.is_nat (oven.ctez_outstanding - p.quantity) with
        | None -> (failwith "more than the outstanding amount of tez" : nat)
        | Some n -> n  in        
        let extracted_balance = (Bitwise.shift_right (p.quantity * s.target) 44n) * 1mutez / 15n in // 44 is 48 - log2(16)
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
        (failwith "not undercollateralized" : result)

let mint_or_burn (s : storage) (quantity: int) : result = 
    let oven : oven = get_oven Tezos.sender s in 
    let ctez_outstanding = match Michelson.is_nat (oven.ctez_outstanding + quantity) with
    | None -> (failwith "cannot burn more ctez than are outstanding" : nat)
    | Some n -> n in
    let oven = {oven with ctez_outstanding = ctez_outstanding} in
    let ovens = Big_map.update Tezos.sender (Some oven) s.ovens in
    let s = {s with ovens = ovens} in
    if is_under_collateralized oven s.target then
        (failwith "cannot withdraw that many ctez, oven would be undercollateralized" : result)
    // mint or burn quantity in the fa1.2 of ctez 
    else
        let ctez_mint_or_burn = get_ctez_mint_or_burn s.ctez_fa12_address in 
        ([Tezos.transaction (quantity, Tezos.sender) 0mutez ctez_mint_or_burn], s)

let cfmm_price (storage : storage) (tez : tez) (token : nat) : result =     
    if Tezos.sender <> storage.cfmm_address then
        (failwith "cfmm_price must be called by the dedicated cfmm contract" : result)
    else
        let delta = abs (Tezos.now - storage.last_drift_update) in
        let target = storage.target in 
        let d_target = Bitwise.shift_right (target * (abs storage.drift) * delta) 48n in
        let target  = if storage.drift < 0  then abs (target - d_target) else target + d_target in
        let drift =         
            if (Bitwise.shift_left (tez / (1mutez)) 54n) > 65n * target * token  then  // 54 is 48 + log2(64)
                storage.drift - delta // this is not homegeneous, but setting the constant delta is multiplied with to 1.0 happens to be reasonable
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
    | Liquidate l -> (liquidate s l : result)
    | Mint_or_burn xs -> (mint_or_burn s xs : result)
    | Cfmm_price xs -> (cfmm_price s xs.0 xs.1 : result)
    | Set_addresses xs -> (set_addresses s xs : result)
    
