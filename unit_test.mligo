(* This is a unit testing framework for ctez *)

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

#include "test_params.mligo"

(* =============================================================================
 * Contract Templates 
 * ============================================================================= *)

(* Newton tests *) 
let test_newton = 
    newton_dx_to_dy (1_000_000n, 1_000_000n, 100n, 0n, (1000n, 1000n), 4)


(* TODO : test these against the python code *)
let test_dtoken_to_dcash = 
    let trade = fun (x, y, dx, target, rounds, (fee_num, fee_denom) : nat * nat * nat * nat * int * (nat * nat)) -> fee_num * (trade_dtoken_for_dcash x y dx target rounds) / fee_denom in 
    let traded = List.map trade trade_params in 
    traded //assert (traded = expected_token_to_cash)

let test_dcash_to_dtoken = 
    let trade = fun (x, y, dy, target, rounds, (fee_num, fee_denom) : nat * nat * nat * nat * int * (nat * nat)) -> fee_num * trade_dcash_for_dtoken x y dy target rounds / fee_denom in 
    let traded = List.map trade trade_params in 
    traded //assert (traded = expected_token_to_cash)