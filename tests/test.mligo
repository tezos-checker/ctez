(* =============================================================================
 * Summary:
 * This is a testing framework for the ctez contracts. It includes:
 *   - A bootstrapping test, which initiates the contracts and checks that
 *     the storage bootstraps as expected.
 *   - Two tests that verify the trading mechanism calculates the values of
 *     trades as a simple formulae of the trade_dtez_for_dcash and 
 *     trade_dcash_for_dtez functions
 * 
 * The functions trade_dtez_for_dcash and trade_dcash_for_dtez are unit tested
 * in the unit_test.mligo file, ensuring that they calculate the expected values.
 * 
 * ============================================================================= *)


(* =============================================================================
 * Contract Templates 
 * ============================================================================= *)

#include "../fa12.mligo"
let main_fa12 = main
type fa12_storage = storage 
type fa12_parameter = parameter 
type fa12_result = result 

let main_lqt = main 
type lqt_storage = storage 
type lqt_parameter = parameter 
type lqt_result = result 

#include "../ctez.mligo"
let main_ctez = main 
type ctez_storage = storage 
type ctez_parameter = parameter 
type ctez_result = result 

#include "../cfmm_tez_ctez.mligo"
let main_cfmm = main
type cfmm_storage = storage 
type cfmm_parameter = parameter 
type cfmm_result = result 

#include "test_params.mligo"

(* =============================================================================
 * Some Aux Functions
 * ============================================================================= *)


(* =============================================================================
 * Generic Setup that Initiates All Contracts
 * ============================================================================= *)

let init_contracts (alice_bal : nat option) (bob_bal : nat option) (init_lqt : nat option) (init_total_supply : nat option) 
                   (init_tez_pool : nat option) (init_cash_pool : nat option) (init_target : nat option) 
                   (init_drift : int option) (last_drift_update : timestamp option) (const_fee : (nat * nat) option) 
                   (pending_pool_updates : nat option) (init_ovens : (oven_handle, oven) big_map option) = 
    // set time 
    let now = ("2000-01-01t10:10:10Z" : timestamp) in 
    
    // set defaults for optional args 
    let alice_bal            = match alice_bal            with | None -> 100n          | Some b -> b in 
    let bob_bal              = match bob_bal              with | None -> 100n          | Some b -> b in 
    let init_lqt             = match init_lqt             with | None -> 10n           | Some l -> l in 
    let init_total_supply    = match init_total_supply    with | None -> 1_000_000_000_000_000n | Some s -> s in 
    let init_cash_pool       = match init_cash_pool       with | None -> 1_000_000_000_000n     | Some c -> c in // muctez, e.g. 1_000_000 tez
    let init_tez_pool        = match init_tez_pool        with | None -> 1_000_000_000_000n     | Some t -> t in // mutez, e.g. 1_000_000 ctez
    let init_target          = match init_target          with | None -> (Bitwise.shift_left 1n 48n) | Some t -> t in // default target is Bitwise.shift_left 1n 48n, equivalent to target price being 1
    let init_drift           = match init_drift           with | None -> 0             | Some d -> d in 
    let last_drift_update    = match last_drift_update    with | None -> now           | Some t -> t in 
    let const_fee            = match const_fee            with | None -> (1000n, 1000n)| Some f -> f in // no default fee
    let pending_pool_updates = match pending_pool_updates with | None -> 0n            | Some p -> p in 
    let init_ovens           = match init_ovens           with | None -> (Big_map.empty : (oven_handle, oven) big_map) | Some o -> o in

    // generate some implicit addresses
    let reset_state_unit = Test.reset_state 6n //([] : tez list)
        ([1_000_000_000tez; 1_000_000_000tez; 1_000_000_000tez; 
          1_000_000_000tez; 1_000_000_000tez; 1_000_000_000tez;]) 
    in
    let (addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin, addr_deploy) = 
        (Test.nth_bootstrap_account 0, Test.nth_bootstrap_account 1, Test.nth_bootstrap_account 2, 
         Test.nth_bootstrap_account 3, Test.nth_bootstrap_account 4, Test.nth_bootstrap_account 5) 
    in 
    let () = Test.set_source addr_deploy in 
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
        target = init_target;
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
        cashPool = init_cash_pool ;
        tezPool  = init_tez_pool ;
        lqtTotal = init_lqt ;
        target = init_target ;
        ctez_address = Tezos.address (Test.to_contract typed_addr_ctez) ;
        cashAddress = Tezos.address (Test.to_contract typed_addr_fa12) ;
        lqtAddress = Tezos.address (Test.to_contract typed_addr_lqt) ;
        lastOracleUpdate = now ;
        consumerEntrypoint = Tezos.address (Test.to_entrypoint "cfmm_price" typed_addr_ctez : (nat * nat) contract) ;
    } in 
    let (typed_addr_cfmm, program_cfmm, size_cfmm) = Test.originate main_cfmm cfmm_init_storage (1mutez * init_cash_pool) in 
    
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

    // mint tokens in the amount of init_cash_pool for the cfmm contract
    let admin_source = Test.set_source addr_admin in 
    let addr_cfmm = Tezos.address (Test.to_contract typed_addr_cfmm) in 
    let entrypoint_mint : mintOrBurn contract = Test.to_entrypoint "mintOrBurn" typed_addr_fa12 in 
    let txndata_mint : mintOrBurn = { quantity=int(init_cash_pool) ; target=addr_cfmm } in 
    let txn_mint = Test.transfer_to_contract_exn entrypoint_mint txndata_mint 0tez in 

    (typed_addr_cfmm, typed_addr_ctez, typed_addr_fa12, typed_addr_lqt,
     addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin)

(* =============================================================================
 * Tests
 * ============================================================================= *)

(******** STANDARD SETUP ********)
let test_setup = 
    // default init setup
    let (typed_addr_cfmm, typed_addr_ctez, typed_addr_fa12, typed_addr_lqt,
         addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin) = 
        init_contracts 
            (None : nat option) (* alice_bal *)
            (None : nat option) (* bob_bal *)
            (None : nat option) (* init_lqt *)
            (None : nat option) (* init_total_supply *)
            (None : nat option) (* init_tez_pool *)
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
        target = 1n; // TODO go up and down 5% in 0.1% increments 
        drift = 0; // TODO should this actually be a pair?
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
    // (* when Bytes works in test *) assert (Bytes.pack expected_ctez_storage = Bytes.pack actual_ctez_storage )


(******** DIFFERENCE EQUATIONS ********)
(**         tez to cash              **)
let trade_tez_to_cash_test (x, y, dx, target, rounds, const_fee : nat * nat * nat * nat * int * (nat * nat)) = 
    let (typed_addr_cfmm, typed_addr_ctez, typed_addr_fa12, typed_addr_lqt,
         addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin) = 
        init_contracts 
            (Some 0n : nat option) (* alice_bal *)
            (Some 0n : nat option) (* bob_bal *)
            (None : nat option) (* init_lqt *)
            (None : nat option) (* init_total_supply *)
            (Some x : nat option) (* init_tez_pool *)
            (Some y : nat option) (* init_cash_pool *)
            (Some target : nat option) (* init_target *)
            (None : int option) (* init_drift *)
            (None : timestamp option) (* last_drift_update *)
            (Some const_fee : (nat * nat) option) (* const_fee *)
            (None : nat option) (* pending_pool_updates *)
            (None : (oven_handle, oven) big_map option) (* init_ovens *)
    in 

    // get the TezToCash entrypoint of the CFMM contract
    let alice_source = Test.set_source addr_alice in 
    let trade_entrypoint : tez_to_cash contract = 
        Test.to_entrypoint "tezToCash" typed_addr_cfmm in 
    let trade_amt = (dx * 1mutez) in 
    let trade_data : tez_to_cash = {
        to_ = addr_alice;
        minCashBought = 0n;
        deadline = ("3000-01-01t10:10:10Z" : timestamp);
        rounds = rounds;
    } in 
    let alice_balance_old = Test.get_balance addr_alice in 
    let alice_trade = 
        (Test.transfer_to_contract_exn trade_entrypoint trade_data trade_amt) in 

    // alice should trade 500ctez for tez
    let ctez_fa12_storage = Test.get_storage typed_addr_fa12 in 
    let ctez_token_balances = ctez_fa12_storage.tokens in 
    let (fee_num, fee_denom) = const_fee in 

    match (Big_map.find_opt addr_alice ctez_token_balances) with 
    | None -> (failwith "Incomplete Cash to Token Transfer" : unit) 
    | Some bal -> assert (bal = fee_num * (trade_dtez_for_dcash x y dx target rounds) / fee_denom)
    // (*debug mode*) | None -> (failwith "Incomplete Cash to Token Transfer" : nat * nat) 
    // (*debug mode*) | Some bal -> (bal, fee_num * (trade_dtez_for_dcash x y dx target rounds) / fee_denom)

let test_tez_to_cash = 
    let test_result = List.map trade_tez_to_cash_test trade_params in 
    () // if it reaches this, everything passed
    //(*debug mode*) test_result 

(**         cash to tez              **)
let trade_tez_to_cash_test (x, y, dy, target, rounds, const_fee : nat * nat * nat * nat * int * (nat * nat)) =
    let alice_initial_bal = dy in // in muctez
    let (typed_addr_cfmm, typed_addr_ctez, typed_addr_fa12, typed_addr_lqt,
         addr_alice, addr_bob, addr_lqt, addr_dummy, addr_admin) = 
        init_contracts 
            (Some alice_initial_bal : nat option) (* alice_bal *)
            (Some 0n : nat option) (* bob_bal *)
            (None : nat option) (* init_lqt *)
            (None : nat option) (* init_total_supply *)
            (Some x : nat option) (* init_tez_pool *)
            (Some y : nat option) (* init_cash_pool *)
            (Some target : nat option) (* init_target *)
            (None : int option) (* init_drift *)
            (None : timestamp option) (* last_drift_update *)
            (Some const_fee : (nat * nat) option) (* const_fee *)
            (None : nat option) (* pending_pool_updates *)
            (None : (oven_handle, oven) big_map option) (* init_ovens *)
    in 
    // get the TokenToCash and Approve entrypoints
    let alice_source = Test.set_source addr_alice in 
    let alice_txn_amt = alice_initial_bal in 
    let addr_cfmm = Tezos.address (Test.to_contract typed_addr_cfmm) in
    let addr_cfmm_balance_old = Test.get_balance addr_cfmm in 
    let bob_balance_old = Test.get_balance addr_bob in 

    // get the CashToTez entrypoint of the CFMM contract
    let trade_entrypoint : cash_to_tez contract = 
        Test.to_entrypoint "cashToTez" typed_addr_cfmm in 
    let trade_data : cash_to_tez = {
        to_ = addr_bob; // send to bob so that gas costs don't factor into the change in balance
        cashSold = alice_txn_amt; // in muctez
        minTezBought = 0n;
        deadline = ("3000-01-01t10:10:10Z" : timestamp);
        rounds = rounds;
    } in 

    // approve entrypoint
    let approve_entrypoint : approve contract = 
        Test.to_entrypoint "approve" typed_addr_fa12 in 
    let approve_data : approve = {
        spender = addr_cfmm ;
        value = alice_txn_amt ;
    } in 
    
    // execute and test
    let alice_approve = 
        (Test.transfer_to_contract_exn approve_entrypoint approve_data 0tez) in         
    let alice_trade = 
        (Test.transfer_to_contract_exn trade_entrypoint trade_data 0tez) in 

    let addr_cfmm_balance = Test.get_balance addr_cfmm in 
    let bob_balance = Test.get_balance addr_bob in 
    let bob_balance_delta = bob_balance / 1mutez - bob_balance_old / 1mutez in 
    let (fee_num, fee_denom) = const_fee in 
    assert (abs bob_balance_delta = fee_num * (trade_dcash_for_dtez x y dy target rounds) / fee_denom)
    // (*debug mode*) (abs bob_balance_delta, fee_num * (trade_dcash_for_dtez x y dy target rounds) / fee_denom)

let test_tez_to_cash = 
    let test_result = List.map trade_tez_to_cash_test trade_params in 
    () // if it reaches this, everything passed
    // (*debug mode*) test_result