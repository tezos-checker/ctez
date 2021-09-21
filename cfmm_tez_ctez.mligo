#include "errors.mligo"

(* Check attic/cfmm_tez_ctez.old.preprocessed.mligo to compare with the old version of ctez *)

[@inline] let error_CALLER_MUST_BE_CTEZ = 1000n
[@inline] let error_ASSERTION_VIOLATED_TEZ_BOUGHT_SHOULD_BE_LESS_THAN_TEZPOOL = 1001n

(* ============================================================================
 * Entrypoints
 * ============================================================================ *)

type add_liquidity =
  [@layout:comb]
  { owner : address ; (* address that will own the minted lqt *)
    minLqtMinted : nat ; (* minimum number of lqt that must be minted *)
    maxCashDeposited : nat ; (* maximum number of cash that may be deposited *)
    deadline : timestamp ; (* time before which the request must be completed *)
  }

type remove_liquidity =
  [@layout:comb]
  { [@annot:to] to_ : address ; (* recipient of the liquidity redemption *)
    lqtBurned : nat ;  (* amount of lqt owned by sender to burn *)
    minTezWithdrawn : nat ; (* minimum amount of tez to withdraw *)
    minCashWithdrawn : nat ; (* minimum amount of cash to withdraw *)
    deadline : timestamp ; (* time before which the request must be completed *)
  }

type tez_to_cash =
  [@layout:comb]
  { [@annot:to] to_ : address ;  (* where to send the cash *)
    minCashBought : nat ; (* minimum amount of cash that must be bought *)
    deadline : timestamp ; (* time before which the request must be completed *)
    rounds : int ; (* number of iterations in estimating the difference equations. Default should be 4n. *)
  }

type cash_to_tez =
  [@layout:comb]
  { [@annot:to] to_ : address ; (* where to send the tez *)
    cashSold : nat ; (* how many cash are being sold *)
    minTezBought : nat ; (* minimum amount of tez desired *)
    deadline : timestamp ; (* time before which the request must be completed *)
    rounds : int ; (* number of iterations in estimating the difference equations. Default should be 4n. *)
  }

type cash_to_token =
  [@layout:comb]
  { [@annot:to] to_ : address ;  (* where to send the tokens *)
    minTokensBought : nat ; (* minimum amount of tokens that must be bought *)
    cashSold : nat ; (* if cash isn't tez, how much cash is sought to be sold *)
    deadline : timestamp ; (* time before which the request must be completed *)
  }

type tez_to_token =
  [@layout:comb]
  { outputCfmmContract : address ; (* other cfmm contract *)
    minTokensBought : nat ; (* minimum amount of cash bought *)
    [@annot:to] to_ : address ; (* where to send the output cash *)
    deadline : timestamp ; (* time before which the request must be completed *)
    rounds : int ; (* number of iterations in estimating the difference equations. Default should be 4n. *)
  }


(* A target t such that t / 2^48 is the target price from the ctez contract *)
type ctez_target = nat


type entrypoint =
| AddLiquidity    of add_liquidity
| RemoveLiquidity of remove_liquidity
| CtezTarget     of ctez_target
| TezToCash     of tez_to_cash
| CashToTez     of cash_to_tez
| TezToToken    of tez_to_token
| SetLqtAddress   of address


(* =============================================================================
 * Storage
 * ============================================================================= *)

type storage =
  [@layout:comb]
  { cashPool : nat ;
    tezPool : nat ;
    lqtTotal : nat ;
    target : ctez_target ;
    ctez_address : address ;
    cashAddress : address ;
    lqtAddress : address ;
    lastOracleUpdate : timestamp ;
    consumerEntrypoint : address ;
  }

(*  Type Synonyms *)

type result = operation list * storage

(* FA2 *)
type cash_id = nat
type balance_of = ((address * cash_id) list * ((((address * nat) * nat) list) contract))
(* FA1.2 *)
type get_balance = address * (nat contract)

type cash_contract_transfer = address * (address * nat)

(* custom entrypoint for LQT FA1.2 *)
type mintOrBurn =
  [@layout:comb]
  { quantity : int ;
    target : address }





(* =============================================================================
 * Constants
 * ============================================================================= *)

[@inline] let null_address = ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address)
[@inline] let const_fee = 9995n (* 0.05% fee *)
[@inline] let const_fee_denom = 10000n

(* =============================================================================
 * Functions
 * ============================================================================= *)

(* this is slightly inefficient to inline, but, nice to have a clean stack for
   the entrypoints for the Coq verification *)
[@inline]
let mutez_to_natural (a: tez) : nat =  a / 1mutez

[@inline]
let natural_to_mutez (a: nat): tez = a * 1mutez

[@inline]
let is_a_nat (i : int) : nat option = Michelson.is_nat i

let ceildiv (numerator : nat) (denominator : nat) : nat = abs ((- numerator) / (int denominator))

[@inline]
let mint_or_burn (storage : storage) (target : address) (quantity : int) : operation =
    (* Returns an operation that mints or burn lqt from the lqt FA1.2 contract. A negative quantity
       corresponds to a burn, a positive one to a mint. *)
    let lqt_admin : mintOrBurn contract =
    match (Tezos.get_entrypoint_opt "%mintOrBurn" storage.lqtAddress :  mintOrBurn contract option) with
    | None -> (failwith error_LQT_CONTRACT_MUST_HAVE_A_MINT_OR_BURN_ENTRYPOINT : mintOrBurn contract)
    | Some contract -> contract in
    Tezos.transaction {quantity = quantity ; target = target} 0mutez lqt_admin

[@inline]
let cash_transfer (storage : storage) (from : address) (to_ : address) (cash_amount : nat) : operation =
    (* Returns an operation that transfers cash between from and to. *)
    let cash_contract: cash_contract_transfer contract =
    match (Tezos.get_entrypoint_opt "%transfer" storage.cashAddress : cash_contract_transfer contract option) with
    | None -> (failwith error_CASH_CONTRACT_MUST_HAVE_A_TRANSFER_ENTRYPOINT : cash_contract_transfer contract)
    | Some contract -> contract in
    Tezos.transaction (from, (to_, cash_amount)) 0mutez cash_contract

[@inline]
let tez_transfer (to_ : address) (tez_amount : nat) : operation=
    (* Tez transfer operation, in the case where TEZ_IS_TEZ *)
    let to_contract : unit contract =
      match (Tezos.get_contract_opt to_ : unit contract option) with
      | None -> (failwith error_INVALID_TO_ADDRESS : unit contract)
      | Some c -> c in
      Tezos.transaction () (natural_to_mutez tez_amount) to_contract

(* A function to transfer assets while maintaining a constant* isoutility.
   * ... or slightly increasing due to loss of precision or incomplete convergence *)

let rec newton_dx_to_dy_rec (xp, xp2, x3y_plus_y3x, y, dy_approx, rounds : nat * nat * nat * nat * nat * int) : nat =
    if rounds <= 0 then
        dy_approx
    else
        let yp = y - dy_approx in
        let yp2 = abs (yp * yp) in
        (* Newton descent formula *)
        (* num is always positive, even without abs which is only there for casting to nat *)
        let num = abs (xp * yp * (xp2 + yp2) - x3y_plus_y3x) in
        let denom  = xp * (xp2 + 3n * yp2) in
        let adjust = num / denom in
        let new_dy_approx = dy_approx + adjust in
        newton_dx_to_dy_rec (xp, xp2, x3y_plus_y3x, y, new_dy_approx, rounds - 1)
    (*
        if denom = 0, then either:
        1. xp = 0 => x + dx = 0, which we don't allow, or
        2. xp = 0 and yp = 0 => a = 0 and (b = 0 or yp = 0), which implies
           that the price target is 0.
     *)

let rec newton_dx_to_dy (x, y, dx, rounds : nat * nat * nat * int) : nat =
    let xp = x + dx in
    let xp2 = xp * xp in
    let x3y_plus_y3x = x * y * (x * x + y * y) in
    newton_dx_to_dy_rec (xp, xp2, x3y_plus_y3x, y, 0n, rounds)


// A function that outputs dy (diff_cash) given x, y, and dx
let trade_dtez_for_dcash (tez : nat) (cash : nat) (dtez : nat) (target : nat) (rounds : int) : nat =
    let x = Bitwise.shift_left tez 48n in
    let y = target * cash  in
    let dx = Bitwise.shift_left dtez 48n in
    let dy_approx = newton_dx_to_dy (x, y, dx, rounds) in
    let dcash_approx = dy_approx / target in
    if (cash - dcash_approx <= 0)  then
        (failwith error_CASH_POOL_MINUS_CASH_WITHDRAWN_IS_NEGATIVE : nat)
    else
        dcash_approx


// A function that outputs dx (diff_tez) given target, x, y, and dy
let trade_dcash_for_dtez (tez : nat) (cash : nat) (dcash : nat) (target : nat) (rounds : int) : nat =
    let x = target * cash in
    let y = Bitwise.shift_left tez 48n in
    let dx = target * dcash in
    let dy_approx = newton_dx_to_dy (x, y, dx, rounds) in
    let dtez_approx = Bitwise.shift_right dy_approx 48n in
    if (tez - dtez_approx <= 0)  then
        (failwith error_TEZ_POOL_MINUS_TEZ_WITHDRAWN_IS_NEGATIVE : nat) (* should never happen *)
    else
        dtez_approx

let marginal_price (tez : nat) (cash : nat) (target : nat) : (nat * nat) =
    let x = cash * target in
    let y = Bitwise.shift_left tez 48n in
    let x2 = x * x in
    let y2 = y * y in
    (tez * (3n * x2 + y2), cash * (3n * y2 + x2))

(* =============================================================================
 * Entrypoint Functions
 * ============================================================================= *)

(* We assume the contract is originated with at least one liquidity
 * provider set up already, so lqtTotal, cashPool and tezPool will
 * always be positive after the initial setup, unless all liquidity is
 * removed, at which point the contract is considered dead and stops working
 * properly. If this is a concern, at least one address should keep at least a
 * very small amount of liquidity in the contract forever. *)

let add_liquidity (param : add_liquidity) (storage: storage) : result =
    (* Adds liquidity to the contract, mints lqt in exchange for the deposited liquidity. *)
    let {
          owner = owner ;
          minLqtMinted = minLqtMinted ;
          maxCashDeposited = maxCashDeposited ;
          deadline = deadline } = param in
    let tezDeposited = mutez_to_natural Tezos.amount in
    if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else
        (* The contract is initialized, use the existing exchange rate
          mints nothing if the contract has been emptied, but that's OK *)
        let tezPool   : nat = storage.tezPool in
        let lqt_minted : nat = tezDeposited * storage.lqtTotal / tezPool in
        let cash_deposited : nat = ceildiv (tezDeposited * storage.cashPool) tezPool in

        if cash_deposited > maxCashDeposited then
            (failwith error_MAX_CASH_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_CASH_DEPOSITED : result)
        else if lqt_minted < minLqtMinted then
            (failwith error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED : result)
        else
            let storage = {storage with
                lqtTotal  = storage.lqtTotal + lqt_minted ;
                cashPool = storage.cashPool + cash_deposited ;
                tezPool  = storage.tezPool + tezDeposited} in

            (* send cash from sender to self *)
            let op_cash = cash_transfer storage Tezos.sender Tezos.self_address cash_deposited in
            (* mint lqt cash for them *)
            let op_lqt = mint_or_burn storage owner (int lqt_minted) in
            ([op_cash; op_lqt], storage)

let remove_liquidity (param : remove_liquidity) (storage : storage) : result =
    (* Removes liquidity to the contract by burning lqt. *)
    let { to_ = to_ ;
          lqtBurned = lqtBurned ;
          minTezWithdrawn = minTezWithdrawn ;
          minCashWithdrawn = minCashWithdrawn ;
          deadline = deadline } = param in

    if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else begin
        let tez_withdrawn : nat = (lqtBurned * storage.tezPool) / storage.lqtTotal in
        let cash_withdrawn : nat = (lqtBurned * storage.cashPool) / storage.lqtTotal in

        (* Check that minimum withdrawal conditions are met *)
        if tez_withdrawn < minTezWithdrawn then
            (failwith error_THE_AMOUNT_OF_TEZ_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TEZ_WITHDRAWN : result)
        else if cash_withdrawn < minCashWithdrawn  then
            (failwith error_THE_AMOUNT_OF_CASH_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_WITHDRAWN : result)
        (* Proceed to form the operations and update the storage *)
        else begin
            (* calculate lqtTotal, convert int to nat *)
            let new_lqtTotal = match (is_a_nat ( storage.lqtTotal - lqtBurned)) with
                (* This check should be unecessary, the fa12 logic normally takes care of it *)
                | None -> (failwith error_CANNOT_BURN_MORE_THAN_THE_TOTAL_AMOUNT_OF_LQT : nat)
                | Some n -> n in
            (* Calculate cashPool, convert int to nat *)
            let new_cashPool = match is_a_nat (storage.cashPool - cash_withdrawn) with
                | None -> (failwith error_CASH_POOL_MINUS_CASH_WITHDRAWN_IS_NEGATIVE : nat)
                | Some n -> n in
            let new_tezPool = match is_nat (storage.tezPool - tez_withdrawn) with
                | None -> (failwith error_TEZ_POOL_MINUS_TEZ_WITHDRAWN_IS_NEGATIVE : nat)
                | Some n -> n in
            let op_lqt = mint_or_burn storage Tezos.sender (0 - lqtBurned) in
            let op_cash = cash_transfer storage Tezos.self_address Tezos.sender cash_withdrawn in
            let op_tez = tez_transfer to_ tez_withdrawn in
            let storage = {storage with tezPool = new_tezPool ; lqtTotal = new_lqtTotal ; cashPool = new_cashPool} in
            ([op_lqt; op_cash; op_tez], storage)
        end
    end

let ctez_target (param : ctez_target) (storage : storage) =
    if Tezos.sender <> storage.ctez_address then
        (failwith error_CALLER_MUST_BE_CTEZ : result)
    else
        let updated_target = param in
        let storage = {storage with target = updated_target} in
        (([] : operation list), storage)


let tez_to_cash (param : tez_to_cash) (storage : storage) =
   let { to_ = to_ ;
         minCashBought = minCashBought ;
         deadline = deadline ;
         rounds = rounds } = param in
    let tezSold = mutez_to_natural Tezos.amount in
    if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else begin
        (* We don't check that tezPool > 0, because that is impossible
           unless all liquidity has been removed. *)
        let tezPool = storage.tezPool in
        let cash_bought =
            // tez -> cash calculation; *includes a fee*
            let bought = trade_dtez_for_dcash tezPool storage.cashPool tezSold storage.target rounds in
            let bought_after_fee = bought * const_fee / const_fee_denom in
            if bought_after_fee < minCashBought then
                (failwith error_CASH_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_BOUGHT : nat)
            else
                bought_after_fee
        in
        let new_cashPool = (match is_nat (storage.cashPool - cash_bought) with
            | None -> (failwith error_CASH_POOL_MINUS_CASH_BOUGHT_IS_NEGATIVE : nat)
            | Some difference -> difference) in

        (* Update tezPool. *)
        let storage = { storage with tezPool = storage.tezPool + tezSold ; cashPool = new_cashPool } in
        (* Send tez from sender to self. *)
        (* Send cash_withdrawn from exchange to sender. *)
        let op_cash = cash_transfer storage Tezos.self_address to_ cash_bought in
        ([op_cash], storage)
    end


let cash_to_tez (param : cash_to_tez) (storage : storage) =
    (* Accepts a payment in cash and sends tez. *)
    let { to_ = to_ ;
          cashSold = cashSold ;
          minTezBought = minTezBought ;
          deadline = deadline ;
          rounds = rounds } = param in


    if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else
        (* We don't check that cashPool > 0, because that is impossible
           unless all liquidity has been removed. *)
        // cash -> tez calculation; *includes a fee*
        let tez_bought =
            let bought = trade_dcash_for_dtez storage.tezPool storage.cashPool cashSold storage.target rounds in
            let bought_after_fee = bought * const_fee / const_fee_denom in
                if bought_after_fee < minTezBought then
                    (failwith error_TEZ_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TEZ_BOUGHT : nat)
                else
                    bought_after_fee
        in

        let op_cash = cash_transfer storage Tezos.sender Tezos.self_address cashSold in
        let op_tez = tez_transfer to_ tez_bought in
        let new_tezPool = match is_nat (storage.tezPool - tez_bought) with
            | None -> (failwith error_ASSERTION_VIOLATED_TEZ_BOUGHT_SHOULD_BE_LESS_THAN_TEZPOOL : nat)
            | Some n -> n in
        let storage = {storage with cashPool = storage.cashPool + cashSold ;
                                    tezPool = new_tezPool} in
        ([op_cash; op_tez], storage)


let default_ (storage : storage) : result =
(* Entrypoint to allow depositing tez. *)
    (* update tezPool *)
    let storage = {storage with tezPool = storage.tezPool + mutez_to_natural Tezos.amount} in (([] : operation list), storage)


let set_lqt_address (lqtAddress : address) (storage : storage) : result =
    if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else if storage.lqtAddress <> null_address then
        (failwith error_LQT_ADDRESS_ALREADY_SET : result)
    else
        (([] : operation list), {storage with lqtAddress = lqtAddress})


let tez_to_token (param : tez_to_token) (storage : storage) : result =
    let { outputCfmmContract = outputCfmmContract ;
          minTokensBought = minTokensBought ;
          to_ = to_ ;
          deadline = deadline ;
          rounds = rounds } = param in

    let outputCfmmContract_contract: cash_to_token contract =
        (match (Tezos.get_entrypoint_opt "%cashToToken" outputCfmmContract : cash_to_token contract option) with
            | None -> (failwith error_INVALID_INTERMEDIATE_CONTRACT :  cash_to_token contract)
            | Some c -> c) in

    if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else
        let tezSold = mutez_to_natural Tezos.amount in
        (* We don't check that cashPool > 0, because that is impossible unless all liquidity has been removed. *)
        let cash_bought =
           (let bought = trade_dtez_for_dcash storage.tezPool storage.cashPool tezSold storage.target rounds in
            bought * const_fee / const_fee_denom)
        in
        let new_cashPool = match is_nat (storage.cashPool - cash_bought) with
            | None -> (failwith error_CASH_POOL_MINUS_CASH_BOUGHT_IS_NEGATIVE : nat)
            | Some n -> n in
        let storage = {storage with tezPool = storage.tezPool + tezSold ;
                                    cashPool = new_cashPool }  in
        let allow_output_to_withdraw_cash =
            let cashContract_approve =  (match (Tezos.get_entrypoint_opt "%approve" storage.cashAddress : (address * nat) contract option) with
                | None -> (failwith error_MISSING_APPROVE_ENTRYPOINT_IN_CASH_CONTRACT : (address * nat) contract)
                | Some c -> c) in
            (Tezos.transaction (outputCfmmContract, 0n)
                          0mutez
                          cashContract_approve,
            Tezos.transaction (outputCfmmContract, cash_bought)
                          0mutez
                          cashContract_approve) in
        let op_send_cash_to_output = Tezos.transaction { minTokensBought = minTokensBought ;
                                      cashSold = cash_bought ;
                                      deadline = deadline ; to_ = to_}
                                      0mutez
                                      outputCfmmContract_contract in
        ([allow_output_to_withdraw_cash.0 ; allow_output_to_withdraw_cash.1 ; op_send_cash_to_output] , storage)


let update_consumer (operations, storage : result) : result =
    if storage.lastOracleUpdate = Tezos.now
        then (operations, storage)
    else
        let consumer = match (Tezos.get_contract_opt storage.consumerEntrypoint : ((nat * nat) contract) option) with
// TODO : when ligo is fixed let consumer = match (Tezos.get_entrypoint_opt "cfmm_price" storage.consumerEntrypoint : ((nat * nat) contract) option) with
        | None -> (failwith error_CANNOT_GET_CFMM_PRICE_ENTRYPOINT_FROM_CONSUMER : (nat * nat) contract)
        | Some c -> c in
        ((Tezos.transaction (marginal_price storage.tezPool storage.cashPool storage.target) 0mutez consumer) :: operations,
        {storage with lastOracleUpdate = Tezos.now})

(* =============================================================================
 * Main
 * ============================================================================= *)

let main ((entrypoint, storage) : entrypoint * storage) : result =
    match entrypoint with
    | AddLiquidity param ->
        add_liquidity param storage
    | RemoveLiquidity param ->
        remove_liquidity param storage
    | CtezTarget param ->
        ctez_target param storage
    | TezToCash param ->
        update_consumer
        (tez_to_cash param storage)
    | CashToTez param ->
        update_consumer
        (cash_to_tez param storage)
    | TezToToken param ->
        update_consumer
        (tez_to_token param storage)
    | SetLqtAddress param ->
        set_lqt_address param storage
