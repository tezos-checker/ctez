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

#include "test_params.mligo"

(* =============================================================================
 * Aux Functions
 * ============================================================================= *)

let rec zip (paired_lists, accum : ((nat list) * (nat list)) * (nat * nat) list) : (nat * nat) list =
  match paired_lists with
  | [], [] -> accum
  | h1::t1, h2::t2 -> zip((t1,t2),((h1,h2)::accum))
  | _, _ -> (failwith "oops, the lists seems to have different lengths" : (nat * nat) list)

(* =============================================================================
 * Test the Trading Functions against Expected Values Calculated Separately
 * ============================================================================= *)

let compare_to_expected_tez_to_cash (f : nat -> nat -> nat -> nat -> int -> nat) = 
    let trade_with_f = fun (x, y, dy, target, rounds, _ : nat * nat * nat * nat * int * (nat * nat)) -> f x y dy target rounds in 
    let traded = List.map trade_with_f trade_params in 
    let expected = expected_tez_to_cash in
    let assertion = List.map (fun (a, b : nat * nat) -> assert(a = b)) (zip ((traded, expected), ([] : (nat * nat) list))) in
    () // if it makes it to this, the test has passed

let test_dtez_to_dcash = 
    compare_to_expected_tez_to_cash trade_dtez_for_dcash

let compare_to_expected_cash_to_tez (f : nat -> nat -> nat -> nat -> int -> nat) = 
    let trade_with_f = fun (x, y, dy, target, rounds, _ : nat * nat * nat * nat * int * (nat * nat)) -> f x y dy target rounds in 
    let traded = List.map trade_with_f trade_params in 
    let expected = expected_cash_to_tez in 
    let assertion = List.map (fun (a, b : nat * nat) -> assert(a = b)) (zip ((traded, expected), ([] : (nat * nat) list))) in
    () // if it makes it to this, the test has passed

let test_dcash_to_dtez = 
    compare_to_expected_cash_to_tez trade_dcash_for_dtez

(* =============================================================================
 * Mutation Testing
 * ============================================================================= *)

(* 

The following tests return the following mutants, which we deem as not a problem:
1. Line 206 of cfmm_tez_ctez.mligo, replacing:
    * (cash - dcash_approx <= 0) => (cash - dcash_approx <= -1)
    * (cash - dcash_approx <= 0) => (cash - dcash_approx = 0)
    * (cash - dcash_approx <= 0) => (cash - dcash_approx < 0)
   By all our calculations, it should be impossible for cash - dcash_approx to ever hit 
   zero or below. Thus it should be impossible to find a test case to differentiate between
   the above scenarios. We keep the check despite the mathematical proof that the scenario 
   should never happen, since bugs in the code can always exist and it seems risky to omit it.

2. The same principle as 1. except for line 219, which has the form (tez - dtez_approx <= 0)

3. Replacing the the initial guess of 0n on line 196 with 1n.
   0n here is not special, as we only need an underestimate of dcash or dtez in order to 
   guarantee the properties we're looking for. In order to differentiate between these cases,
   we would have to find something that trades for 0n and can't be successfully approximated
   by 1n or something so extreme that for low numbers of rounds the end is determined
   by the initial guess. I have yet to find a case that can differentiate between 0n and 1n 
   on initial guesses.

*)

let test_mutation_dtez_to_dcash = 
    Test.mutation_test_all trade_dtez_for_dcash compare_to_expected_tez_to_cash

let test_mutation_dtez_to_dcash = 
    Test.mutation_test_all trade_dcash_for_dtez compare_to_expected_cash_to_tez
