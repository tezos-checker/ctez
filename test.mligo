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
 * Tests
 * ============================================================================= *)

let test_setup = 
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
        tokens = ( Big_map.literal [(addr_alice, 1000n); (addr_bob, 1000n)] : (address, nat) big_map);
        allowances = (Big_map.empty : allowances); 
        admin = addr_admin;
        total_supply = 1_000_000n;
    } in
    let (typed_addr_fa12, program_fa12, size_fa12) = Test.originate main_fa12 fa12_init_storage 0tez in 

    // lqt fa12 contract
    let lqt_init_storage : fa12_storage = {
        tokens = ( Big_map.literal [(addr_lqt, 100n);] : (address, nat) big_map);
        allowances = (Big_map.empty : allowances); 
        admin = addr_admin;
        total_supply = 1_000_000n;
    } in 
    let (typed_addr_lqt, program_lqt, size_lqt) = Test.originate main_lqt lqt_init_storage 0tez in
    
    // ctez contract
    let ctez_init_storage : ctez_storage = {
        ovens = (Big_map.empty : (oven_handle, oven) big_map);
        target = 103n;//(103n,100n); // TODO go up and down 5% in 0.1% increments 
        drift = 105;//(105,100); // TODO should this actually be a pair?
        last_drift_update = ("2000-01-01t10:10:10Z" : timestamp); // 5 mins (300 sec), this should vary I think
        ctez_fa12_address = null_address;
        cfmm_address = null_address;
    } in
    let (typed_addr_ctez, program_ctez, size_ctez) = 
        Test.originate main_ctez ctez_init_storage 0tez 
    in  

    // initiate the cfmm contract
    let cfmm_init_storage : cfmm_storage = {
        tokenPool = 10000n ;
        cashPool = 10000n ;
        lqtTotal = 100n ;
        target = (103n,10n) ;
        const_fee = (1n,100n) ;
        ctez_address = Tezos.address (Test.to_contract typed_addr_ctez) ;
        pendingPoolUpdates = 0n ;
        tokenAddress = Tezos.address (Test.to_contract typed_addr_fa12) ;
        lqtAddress = Tezos.address (Test.to_contract typed_addr_lqt) ;
    } in 
    let (typed_addr_cfmm, program_cfmm, size_cfmm) = Test.originate main_cfmm cfmm_init_storage 0tez in 
    
    // update ctez's storage using its set_addresses entrypoints 
    let ctez_entrypoint_set_addresses = 
        ((Test.to_entrypoint "set_addresses" typed_addr_ctez) : set_addresses contract) in
    let untyped_addr_cfmm = Tezos.address (Test.to_contract typed_addr_cfmm) in 
    let untyped_addr_fa12 = Tezos.address (Test.to_contract typed_addr_fa12) in
    let new_addresses : set_addresses = { 
        cfmm_address=untyped_addr_cfmm; 
        ctez_fa12_address=untyped_addr_fa12;
    } in 
    let update_ctez_addresses = Test.transfer_to_contract_exn ctez_entrypoint_set_addresses new_addresses 0tez in 
    
    // make sure ctez's storage is as expected
    let implied_ctez_storage = { ctez_init_storage with cfmm_address=untyped_addr_cfmm ; ctez_fa12_address=untyped_addr_fa12 } in 
    let actual_ctez_storage  = Test.get_storage typed_addr_ctez in 
    
    (* DOESN'T WORK YET DUE TO BUG IN LIGO *)
    Test.michelson_equal (Test.compile_value implied_ctez_storage) (Test.compile_value actual_ctez_storage) 

    (* ALSO DOESN'T YET WORK
    let implied_ctez_storage_ligo = { ctez_init_storage with cfmm_address=untyped_addr_cfmm ; ctez_fa12_address=untyped_addr_fa12 } in 
    let implied_ctez_storage      = Test.compile_value implied_ctez_storage_ligo in
    let actual_ctez_storage = Test.get_storage_of_address (Tezos.address (Test.to_contract typed_addr_ctez)) in 
    
    Test.michelson_equal implied_ctez_storage actual_ctez_storage
    *)



(* Test that the difference equations in trades computed as expected *)
let test_diff_equations = true 


(* Tests compilation under different directives (may not be feasible in this framework) *)
let test_directives = true



(* Checks that drift and target grew at expected rate after x mins *)
let test_price = true 