(* This is a testing framework for ctez *)

(* =============================================================================
 * Contract Templates 
 * ============================================================================= *)

#include "fa12.mligo"
let main_fa12 = main
type fa12_storage = storage 
type fa12_parameter = parameter 
type fa12_result = result 

let main_lqt = main 
type lqt_storage = storage 
type lqt_parameter = parameter 
type lqt_result = result 

#include "ctez.mligo"
let main_ctez = main 
type ctez_storage = storage 
type ctez_parameter = parameter 
type ctez_result = result 

#include "cfmm.mligo"
let main_cfmm = main
type cfmm_storage = storage 
type cfmm_parameter = parameter 
type cfmm_result = result 


(* =============================================================================
 * Generic Setup that Initiates All Contracts
 * ============================================================================= *)

let init_contracts (alice_bal : nat option) (bob_bal : nat option) (init_lqt : nat option) (init_total_supply : nat option) 
                   (init_token_pool : nat option) (init_cash_pool : nat option) (init_target : nat option) 
                   (init_drift : int option) (last_drift_update : timestamp option) (const_fee : (nat * nat) option) 
                   (pending_pool_updates : nat option) (init_ovens : (oven_handle, oven) big_map option) = 
    // set defaults for optional args 
    let alice_bal            = match alice_bal            with | None -> 100n        | Some b -> b in 
    let bob_bal              = match bob_bal              with | None -> 100n        | Some b -> b in 
    let init_lqt             = match init_lqt             with | None -> 10n         | Some l -> l in 
    let init_total_supply    = match init_total_supply    with | None -> 1_000_000n  | Some s -> s in 
    let init_token_pool      = match init_token_pool      with | None -> 10_000n     | Some t -> t in 
    let init_cash_pool       = match init_cash_pool       with | None -> 10_000n     | Some c -> c in 
    let init_target          = match init_target          with | None -> 131072n     | Some t -> t in // default target is 1 (Bitwise.shift_left 2n 48n)
    let init_drift           = match init_drift           with | None -> 0           | Some d -> d in 
    let last_drift_update    = match last_drift_update    with | None -> ("2021-01-01t10:10:10Z" : timestamp) | Some t -> t in 
    let const_fee            = match const_fee            with | None -> (1n, 1n)  | Some f -> f in // no default fee
    let pending_pool_updates = match pending_pool_updates with | None -> 0n          | Some p -> p in 
    let init_ovens           = match init_ovens           with | None -> (Big_map.empty : (oven_handle, oven) big_map) | Some o -> o in

    // generate some implicit addresses
    let reset_state_unit = Test.reset_state 5n ([] : nat list) in
    let (addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin) = 
        (Test.nth_bootstrap_account 0, Test.nth_bootstrap_account 1, Test.nth_bootstrap_account 2, 
         Test.nth_bootstrap_account 3, Test.nth_bootstrap_account 4)
    in 
    let null_address = ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) in 

    // ctez fa12 contract 
    let fa12_init_storage : fa12_storage = 
    {
        tokens = ( Big_map.literal [(addr_alice, alice_bal); (addr_bob, bob_bal)] : (address, nat) big_map);
        allowances = (Big_map.empty : allowances); 
        admin = addr_admin;
        total_supply = init_total_supply;
    } in
    let (typed_addr_fa12, program_fa12, size_fa12) = Test.originate main_fa12 fa12_init_storage 0tez in 

    // lqt fa12 contract
    let lqt_init_storage : fa12_storage = {
        tokens = ( Big_map.literal [(addr_lqt, init_lqt);] : (address, nat) big_map);
        allowances = (Big_map.empty : allowances); 
        admin = addr_admin;
        total_supply = init_total_supply;
    } in 
    let (typed_addr_lqt, program_lqt, size_lqt) = Test.originate main_lqt lqt_init_storage 0tez in
    
    // ctez contract
    let ctez_init_storage : ctez_storage = {
        ovens = init_ovens;
        target = 103n;//(103n,100n);
        drift = init_drift;
        last_drift_update = last_drift_update;
        ctez_fa12_address = null_address;
        cfmm_address = null_address;
    } in
    let (typed_addr_ctez, program_ctez, size_ctez) = 
        Test.originate main_ctez ctez_init_storage 0tez 
    in  

    // initiate the cfmm contract
    let cfmm_init_storage : cfmm_storage = {
        tokenPool = init_token_pool ;
        cashPool = init_cash_pool ;
        lqtTotal = init_lqt ;
        target = init_target ;
        const_fee = const_fee;
        ctez_address = Tezos.address (Test.to_contract typed_addr_ctez) ;
        pendingPoolUpdates = 0n ;
        tokenAddress = Tezos.address (Test.to_contract typed_addr_fa12) ;
        lqtAddress = Tezos.address (Test.to_contract typed_addr_lqt) ;
    } in 
    let (typed_addr_cfmm, program_cfmm, size_cfmm) = Test.originate main_cfmm cfmm_init_storage (1tez * init_cash_pool) in 
    
    // update ctez's storage using its set_addresses entrypoints 
    let entrypoint_set_addresses = 
        ((Test.to_entrypoint "set_addresses" typed_addr_ctez) : set_addresses contract) in
    let untyped_addr_cfmm = Tezos.address (Test.to_contract typed_addr_cfmm) in 
    let untyped_addr_fa12 = Tezos.address (Test.to_contract typed_addr_fa12) in
    let txndata_set_addresses : set_addresses = { 
        cfmm_address=untyped_addr_cfmm; 
        ctez_fa12_address=untyped_addr_fa12;
    } in 
    let update_ctez_addresses = Test.transfer_to_contract_exn entrypoint_set_addresses txndata_set_addresses 0tez in 

    // mint tokens in the amount of init_token_pool for the cfmm contract
    let admin_source = Test.set_source addr_admin in 
    let addr_cfmm = Tezos.address (Test.to_contract typed_addr_cfmm) in 
    let entrypoint_mint : mintOrBurn contract = Test.to_entrypoint "mintOrBurn" typed_addr_fa12 in 
    let txndata_mint : mintOrBurn = { quantity=int(init_token_pool) ; target=addr_cfmm } in 
    let txn_mint = Test.transfer_to_contract_exn entrypoint_mint txndata_mint 0tez in 

    (typed_addr_cfmm, typed_addr_ctez, typed_addr_fa12, typed_addr_lqt,
     addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin)

(* =============================================================================
 * Tests
 * ============================================================================= *)

(* Run setup with default args; verify ctez storage is as expected *)
let test_setup = 
    let (typed_addr_cfmm, typed_addr_ctez, typed_addr_fa12, typed_addr_lqt,
         addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin) = 
        init_contracts 
            (None : nat option) (* alice_bal *)
            (None : nat option) (* bob_bal *)
            (None : nat option) (* init_lqt *)
            (None : nat option) (* init_total_supply *)
            (None : nat option) (* init_token_pool *)
            (None : nat option) (* init_cash_pool *)
            (None : nat option) (* init_target *)
            (None : int option) (* init_drift *)
            (None : timestamp option) (* last_drift_update *)
            (None : (nat * nat) option) (* const_fee *)
            (None : nat option) (* pending_pool_updates *)
            (None : (oven_handle, oven) big_map option) (* init_ovens *)
    in 
    // make sure ctez's storage is as expected
    let untyped_addr_fa12 = Tezos.address (Test.to_contract typed_addr_fa12) in
    let untyped_addr_cfmm = Tezos.address (Test.to_contract typed_addr_cfmm) in 
    let expected_ctez_storage : ctez_storage = {
        ovens = (Big_map.empty : (oven_handle, oven) big_map);
        target = 103n;//(103n,100n); // TODO go up and down 5% in 0.1% increments 
        drift = 105;//(105,100); // TODO should this actually be a pair?
        last_drift_update = ("2000-01-01t10:10:10Z" : timestamp); // 5 mins (300 sec), this should vary I think
        ctez_fa12_address = untyped_addr_fa12;
        cfmm_address = untyped_addr_cfmm;
    } in 
    let actual_ctez_storage  = Test.get_storage typed_addr_ctez in 
    
    // assertions to verify storage is as expected
    (
        assert (expected_ctez_storage.cfmm_address      = actual_ctez_storage.cfmm_address),
        assert (expected_ctez_storage.ctez_fa12_address = actual_ctez_storage.ctez_fa12_address)
    )


(* Test that the difference equations in trades computed as expected *)
let test_diff_equations = 
    let (typed_addr_cfmm, typed_addr_ctez, typed_addr_fa12, typed_addr_lqt,
         addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin) = 
        init_contracts 
            (Some 0n : nat option) (* alice_bal *)
            (Some 0n : nat option) (* bob_bal *)
            (None : nat option) (* init_lqt *)
            (None : nat option) (* init_total_supply *)
            (None : nat option) (* init_token_pool *)
            (None : nat option) (* init_cash_pool *)
            (None : nat option) (* init_target *)
            (None : int option) (* init_drift *)
            (None : timestamp option) (* last_drift_update *)
            (None : (nat * nat) option) (* const_fee *)
            (None : nat option) (* pending_pool_updates *)
            (None : (oven_handle, oven) big_map option) (* init_ovens *)
    in 
        // get the TokenToCash entrypoint 
        let alice_source = Test.set_source addr_alice in 
        let trade_entrypoint : cash_to_token contract = 
            Test.to_entrypoint "cashToToken" typed_addr_cfmm in 
        let trade_data : cash_to_token = {
            to_ = addr_alice;
            minTokensBought = 1n;
            deadline = ("3000-01-01t10:10:10Z" : timestamp);
            rounds = 4; // default 
        } in 
        let trade_amt = 10tez in 
        let alice_trade = 
            (Test.transfer_to_contract_exn trade_entrypoint trade_data trade_amt) in 
        // alice should trade 500ctez for tez
        let ctez_fa12_storage = Test.get_storage typed_addr_fa12 in 
        let ctez_token_balances = ctez_fa12_storage.tokens in 
        Big_map.find_opt addr_alice ctez_token_balances 



(* Tests compilation under different directives (may not be feasible in this framework) *)
let test_directives = ()


(* Checks that drift and target grew at expected rate after x mins *)
let test_price = () 
    // 5 mins, or 300 secs will be default 
    // target should go up and down 5% in 0.1% increments