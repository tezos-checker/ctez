(* This is a unit testing framework for ctez *)

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

#include "../test_params.mligo"

(* =============================================================================
 * Aux Functions
 * ============================================================================= *)

let rec zip (paired_lists, accum : ((nat list) * (nat list)) * (nat * nat) list) : (nat * nat) list =
  match paired_lists with
  | [], [] -> accum
  | h1::t1, h2::t2 -> zip((t1,t2),((h1,h2)::accum))
  | _, _ -> (failwith "oops, the lists seems to have different lengths" : (nat * nat) list)

(* =============================================================================
 * Test the Trading Functions against the Python Model
 * ============================================================================= *)

let test_dtoken_to_dcash = 
    let trade = fun (x, y, dx, target, rounds, (fee_num, fee_denom) : nat * nat * nat * nat * int * (nat * nat)) -> fee_num * (trade_dtoken_for_dcash x y dx target rounds) / fee_denom in 
    let traded = List.map trade trade_params in 
    let expected = List.map (fun (input : nat) -> input * 9_995n / 10_000n) expected_token_to_cash in 
    let assertion = List.map (fun (a,b : nat * nat) -> assert (a = b)) (zip ((traded, expected), ([] : (nat * nat) list))) in 
    () // if it makes it to this, the test has passed 

let test_dcash_to_dtoken = 
    let trade = fun (x, y, dy, target, rounds, (fee_num, fee_denom) : nat * nat * nat * nat * int * (nat * nat)) -> fee_num * trade_dcash_for_dtoken x y dy target rounds / fee_denom in 
    let traded = List.map trade trade_params in 
    let expected = List.map (fun (input : nat) -> input * 9_995n / 10_000n) expected_cash_to_token in 
    let assertion = List.map (fun (a,b : nat * nat) -> assert (a = b)) (zip ((traded, expected), ([] : (nat * nat) list))) in
    () // if it makes it to this, the test has passed 
