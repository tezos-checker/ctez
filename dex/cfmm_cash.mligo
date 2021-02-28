// #define CASH_IS_TEZ
// #define CASH_IS_FA2
#define CASH_IS_FA12

#define TOKEN_IS_FA2

// =============================================================================
// Entrypoints
// =============================================================================

type add_liquidity =
  [@layout:comb]
  { owner : address ;       
    minLqtMinted : nat ;
    maxTokensDeposited : nat ;
#if !CASH_IS_TEZ
    cashDeposited : nat ;
#endif
    deadline : timestamp ;
  }

type remove_liquidity =
  [@layout:comb]
  { [@annot:to] to_ : address ; // recipient of the liquidity redemption
    lqtBurned : nat ;  // amount of lqt owned by sender to burn
    minCashWithdrawn : nat ; // minimum amount of cash to withdraw
    minTokensWithdrawn : nat ; // minimum amount of tokens to withdraw
    deadline : timestamp ; // the time before which the request must be completed
  }

type cash_to_token =
  [@layout:comb]
  { [@annot:to] to_ : address ;      
    minTokensBought : nat ;
#if !CASH_IS_TEZ
    cashSold : nat ;
#endif
    deadline : timestamp ;
  }

type token_to_cash =
  [@layout:comb]
  { [@annot] to_ : address ;
    tokensSold : nat ;
    minCashBought : nat ;
    deadline : timestamp ;
  }

type set_baker =
  [@layout:comb]
  { baker : key_hash option ;
    freezeBaker : bool ;
  }

type token_to_token =
  [@layout:comb]
  { outputDexterContract : address ;
    minTokensBought : nat ;
    [@annot:to] to_ : address ;
    tokensSold : nat ;
    deadline : timestamp ;
  }


type update_fa12_pool = nat
type update_fa2_pool = ((address * nat)  * nat) list 

#if TOKEN_IS_FA2
type update_token_pool_internal = update_fa2_pool
#else
type update_token_pool_internal = update_fa12_pool
#endif

#if CASH_IS_FA2
type update_cash_pool_internal = update_fa2_pool
#endif 

#if CASH_IS_FA12
type update_cash_pool_internal = update_fa12_pool
#endif 

type entrypoint =
| AddLiquidity    of add_liquidity
| RemoveLiquidity of remove_liquidity
| CashToToken     of cash_to_token
| TokenToCash     of token_to_cash
| TokenToToken    of token_to_token
| UpdatePools     of unit
| UpdateTokenPoolInternal of update_token_pool_internal
#if CASH_IS_TEZ
| SetBaker        of set_baker
| SetManager      of address
| Default         of unit
#else
| UpdateCashPoolInternal of update_cash_pool_internal
#endif
| SetLqtAddress   of address



// =============================================================================
// Storage
// =============================================================================

type storage =
  [@layout:comb]
  { tokenPool : nat ;
    cashPool : nat ;
    lqtTotal : nat ;
    selfIsUpdatingPool : bool ;
#if CASH_IS_TEZ
    freezeBaker : bool ;    
#endif
    manager : address ;
    tokenAddress : address ;
#if TOKEN_IS_FA2
    tokenId : nat ;
#endif
#if !CASH_IS_TEZ
    cashAddress : address ;
#endif
#if CASH_IS_FA2
    cashId : nat ;
#endif
    lqtAddress : address ;
  }

// =============================================================================
// Type Synonyms
// =============================================================================

type result = operation list * storage

// FA2
type token_id = nat
type balance_of = ((address * token_id) list * ((((address * nat) * nat) list) contract))
// FA1.2
type get_balance = address * (nat contract)

#if TOKEN_IS_FA2
// FA2
type token_contract_transfer = (address * (address * (token_id * nat)) list) list
#else
// FA1.2
type token_contract_transfer = address * (address * nat)
#endif

#if CASH_IS_FA2
// FA2
type cash_contract_transfer = (address * (address * (token_id * nat)) list) list
#else
// FA1.2
type cash_contract_transfer = address * (address * nat)
#endif

// custom entrypoint for LQT FA1.2
type mintOrBurn =
  [@layout:comb]
  { quantity : int ;
    target : address }

// =============================================================================
// Error codes
// =============================================================================

[@inline] let error_TOKEN_CONTRACT_MUST_HAVE_A_TRANSFER_ENTRYPOINT  = 0n
[@inline] let error_ASSERTION_VIOLATED_CASH_BOUGHT_SHOULD_BE_LESS_THAN_CASHPOOL = 1n
[@inline] let error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE       = 2n
[@inline] let error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE = 3n
[@inline] let error_MAX_TOKENS_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_TOKENS_DEPOSITED = 4n
[@inline] let error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED = 5n
(* 6n *)
(* 7n *)
[@inline] let error_CASH_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_BOUGHT = 8n
[@inline] let error_INVALID_TO_ADDRESS = 9n
[@inline] let error_AMOUNT_MUST_BE_ZERO = 10n
[@inline] let error_THE_AMOUNT_OF_CASH_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_WITHDRAWN = 11n
[@inline] let error_LQT_CONTRACT_MUST_HAVE_A_MINT_OR_BURN_ENTRYPOINT = 12n
[@inline] let error_THE_AMOUNT_OF_TOKENS_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_WITHDRAWN = 13n
[@inline] let error_CANNOT_BURN_MORE_THAN_THE_TOTAL_AMOUNT_OF_LQT = 14n
[@inline] let error_TOKEN_POOL_MINUS_TOKENS_WITHDRAWN_IS_NEGATIVE = 15n
(* 16n *)
(* 17n *)
[@inline] let error_TOKENS_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_BOUGHT = 18n
[@inline] let error_TOKEN_POOL_MINUS_TOKENS_BOUGHT_IS_NEGATIVE = 19n
[@inline] let error_ONLY_MANAGER_CAN_SET_BAKER = 20n
[@inline] let error_ONLY_MANAGER_CAN_SET_MANAGER = 21n
[@inline] let error_BAKER_PERMANENTLY_FROZEN = 22n
[@inline] let error_ONLY_MANAGER_CAN_SET_LQT_ADRESS = 23n
[@inline] let error_LQT_ADDRESS_ALREADY_SET = 24n
[@inline] let error_CALL_NOT_FROM_AN_IMPLICIT_ACCOUNT = 25n
(* 26n *)
(* 27n *)
#if TOKEN_IS_FA2
[@inline] let error_INVALID_FA2_TOKEN_CONTRACT_MISSING_BALANCE_OF = 28n
#else
[@inline] let error_INVALID_FA12_TOKEN_CONTRACT_MISSING_GETBALANCE = 28n
#endif
[@inline] let error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_TOKENADDRESS = 29n
(* 30n *)
[@inline] let error_INVALID_INTERMEDIATE_CONTRACT = 31n
#if !CASH_IS_TEZ
[@inline] let error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_CASHADDRESS = 30n
[@inline] let error_TEZ_DEPOSIT_WOULD_BE_BURNED = 32n
#if CASH_IS_FA2
[@inline] let error_INVALID_FA2_CASH_CONTRACT_MISSING_GETBALANCE = 33n
#else
[@inline] let error_INVALID_FA12_CASH_CONTRACT_MISSING_GETBALANCE = 33n
[@inline] let error_MISSING_APPROVE_ENTRYPOINT_IN_CASH_CONTRACT = 34n
#endif
#endif


// =============================================================================
// Functions
// =============================================================================

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
    let lqt_admin : mintOrBurn contract =
    match (Tezos.get_entrypoint_opt "%mintOrBurn" storage.lqtAddress :  mintOrBurn contract option) with
    | None -> (failwith error_LQT_CONTRACT_MUST_HAVE_A_MINT_OR_BURN_ENTRYPOINT : mintOrBurn contract)
    | Some contract -> contract in
    Tezos.transaction {quantity = quantity ; target = target} 0mutez lqt_admin

[@inline]
let token_transfer (storage : storage) (from : address) (to_ : address) (token_amount : nat) : operation =
    let token_contract: token_contract_transfer contract =
    match (Tezos.get_entrypoint_opt "%transfer" storage.tokenAddress : token_contract_transfer contract option) with
    | None -> (failwith error_TOKEN_CONTRACT_MUST_HAVE_A_TRANSFER_ENTRYPOINT : token_contract_transfer contract)
    | Some contract -> contract in
#if TOKEN_IS_FA2
    Tezos.transaction [(from, [(to_, (storage.tokenId, token_amount))])] 0mutez token_contract
#else
    Tezos.transaction (from, (to_, token_amount)) 0mutez token_contract
#endif

[@inline]
#if CASH_IS_TEZ
let cash_transfer (to_ : address) (cash_amount : nat) : operation= 
    let to_contract : unit contract =
      match (Tezos.get_contract_opt to_ : unit contract option) with
      | None -> (failwith error_INVALID_TO_ADDRESS : unit contract)
      | Some c -> c in
      Tezos.transaction () (natural_to_mutez cash_amount) to_contract    
#else
let cash_transfer (storage : storage) (from : address) (to_ : address) (cash_amount : nat) : operation= 
    let cash_contract: cash_contract_transfer contract =
    match (Tezos.get_entrypoint_opt "%transfer" storage.cashAddress : cash_contract_transfer contract option) with
    | None -> (failwith error_TOKEN_CONTRACT_MUST_HAVE_A_TRANSFER_ENTRYPOINT : cash_contract_transfer contract)
    | Some contract -> contract in
#if CASH_IS_FA2
    Tezos.transaction [(from, [(to_, (storage.cashId, cash_amount))])] 0mutez cash_contract
#else
    Tezos.transaction (from, (to_, cash_amount)) 0mutez cash_contract
#endif
#endif

// =============================================================================
// Entrypoint Functions
// =============================================================================

let add_liquidity (param : add_liquidity) (storage: storage) : result =
    let { 
          owner = owner ;
          minLqtMinted = minLqtMinted ;
          maxTokensDeposited = maxTokensDeposited ;
#if !CASH_IS_TEZ        
          cashDeposited = cashDeposited ;
#endif
          deadline = deadline } = param in
#if CASH_IS_TEZ
    let cashDeposited = mutez_to_natural Tezos.amount in
#endif
    if storage.selfIsUpdatingPool then
        (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else
        // the contract is initialized, use the existing exchange rate
        // mints nothing if the contract has been emptied, but that's OK
        let cashPool   : nat = storage.cashPool in
        let lqt_minted : nat = cashDeposited * storage.lqtTotal / cashPool in
        let tokens_deposited : nat = ceildiv (cashDeposited * storage.tokenPool) cashPool in

        if tokens_deposited > maxTokensDeposited then
            (failwith error_MAX_TOKENS_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_TOKENS_DEPOSITED : result)
        else if lqt_minted < minLqtMinted then
            (failwith error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED : result)
        else
            let storage = {storage with
                lqtTotal  = storage.lqtTotal + lqt_minted ;
                tokenPool = storage.tokenPool + tokens_deposited ;
                cashPool  = storage.cashPool + cashDeposited} in

            // send tokens from sender to self
            let op_token = token_transfer storage Tezos.sender Tezos.self_address tokens_deposited in     
#if !CASH_IS_TEZ
            // send cash from sender to self
            let op_cash = cash_transfer storage Tezos.self_address Tezos.sender cashDeposited in
#endif
            // mint lqt tokens for them
            let op_lqt = mint_or_burn storage owner (int lqt_minted) in

            ([op_token;
#if !CASH_IS_TEZ            
             op_cash;
#endif
             op_lqt], storage)

let remove_liquidity (param : remove_liquidity) (storage : storage) : result =
    let { to_ = to_ ;
          lqtBurned = lqtBurned ;
          minCashWithdrawn = minCashWithdrawn ;
          minTokensWithdrawn = minTokensWithdrawn ;
          deadline = deadline } = param in

    if storage.selfIsUpdatingPool then
      (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else begin
        let cash_withdrawn : nat = (lqtBurned * storage.cashPool) / storage.lqtTotal in
        let tokens_withdrawn : nat = (lqtBurned * storage.tokenPool) / storage.lqtTotal in

        // Check that minimum withdrawal conditions are met
        if cash_withdrawn < minCashWithdrawn then
            (failwith error_THE_AMOUNT_OF_CASH_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_WITHDRAWN : result)
        else if tokens_withdrawn < minTokensWithdrawn  then
            (failwith error_THE_AMOUNT_OF_TOKENS_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_WITHDRAWN : result)
        // Proceed to form the operations and update the storage
        else begin                                                                
            // calculate lqtTotal, convert int to nat
            let new_lqtTotal = match (is_a_nat ( storage.lqtTotal - lqtBurned)) with
                // This check should be unecessary, the fa12 logic normally takes care of it
                | None -> (failwith error_CANNOT_BURN_MORE_THAN_THE_TOTAL_AMOUNT_OF_LQT : nat)
                | Some n -> n in
            // Calculate tokenPool, convert int to nat
            let new_tokenPool = match is_a_nat (storage.tokenPool - tokens_withdrawn) with
                | None -> (failwith error_TOKEN_POOL_MINUS_TOKENS_WITHDRAWN_IS_NEGATIVE : nat)
                | Some n -> n in
            let new_cashPool = match is_nat (storage.cashPool - cash_withdrawn) with
                | None -> (failwith "TODO error" : nat)
                | Some n -> n in
            let op_lqt = mint_or_burn storage Tezos.sender (0 - lqtBurned) in
            let op_token = token_transfer storage Tezos.self_address Tezos.sender tokens_withdrawn in
#if CASH_IS_TEZ
            let op_cash = cash_transfer to_ cash_withdrawn in
#else            
            let op_cash = cash_transfer storage Tezos.self_address to_ cash_withdrawn in
#endif        
            let storage = {storage with cashPool = new_cashPool ; lqtTotal = new_lqtTotal ; tokenPool = new_tokenPool} in
            ([op_lqt; op_token; op_cash], storage)
        end
    end


let cash_to_token (param : cash_to_token) (storage : storage) =
   let { to_ = to_ ;
         minTokensBought = minTokensBought ;
#if !CASH_IS_TEZ         
         cashSold = cashSold ;
#endif         
         deadline = deadline } = param in

#if CASH_IS_TEZ
    let cashSold = mutez_to_natural Tezos.amount in
#endif    
    if storage.selfIsUpdatingPool then
        (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else begin

        let cashPool = storage.cashPool in
        let tokens_bought = 
            (let bought = (cashSold * 997n * storage.tokenPool) / (cashPool * 1000n + (cashSold * 997n)) in
            if bought < minTokensBought then
                (failwith error_TOKENS_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_BOUGHT : nat)
            else
                bought)
        in    
        let new_tokenPool = (match is_nat (storage.tokenPool - tokens_bought) with
            | None -> (failwith error_TOKEN_POOL_MINUS_TOKENS_BOUGHT_IS_NEGATIVE : nat)
            | Some difference -> difference) in

        // update cashPool
        let storage = { storage with cashPool = storage.cashPool + cashSold ; tokenPool = new_tokenPool } in
        // send cash from sender to self
#if !CASH_IS_TEZ
        let op_cash = cash_transfer storage Tezos.sender Tezos.self_address cashSold in
#endif
        // send tokens_withdrawn from exchange to sender
        let op_token = token_transfer storage Tezos.self_address Tezos.sender tokens_bought in
        ([
#if !CASH_IS_TEZ            
            op_cash;
#endif            
            op_token], storage)
    end


let token_to_cash (param : token_to_cash) (storage : storage) =
    let { to_ = to_ ;        
          tokensSold = tokensSold ;
          minCashBought = minCashBought ;
          deadline = deadline } = param in

    if storage.selfIsUpdatingPool then
        (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else
        let cash_bought = 
            let bought = ((tokensSold * 997n * storage.cashPool) / (storage.tokenPool * 1000n + (tokensSold * 997n)))  in
                if bought < minCashBought then (failwith error_CASH_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_CASH_BOUGHT : nat) else bought in

        let op_token = token_transfer storage Tezos.sender Tezos.self_address tokensSold in
#if CASH_IS_TEZ        
        let op_cash = cash_transfer to_  cash_bought in
#else
        let op_cash = cash_transfer storage Tezos.self_address  to_ cash_bought in
#endif   
        let new_cashPool = match is_nat (storage.cashPool - cash_bought) with
            | None -> (failwith error_ASSERTION_VIOLATED_CASH_BOUGHT_SHOULD_BE_LESS_THAN_CASHPOOL : nat)
            | Some n -> n in
        let storage = {storage with tokenPool = storage.tokenPool + tokensSold ;
                                    cashPool = new_cashPool} in
        ([op_token; op_cash], storage)

// entrypoint to allow depositing tez
let default_ (storage : storage) : result = 
#if CASH_IS_TEZ
    // update cashPool
    if (storage.selfIsUpdatingPool) then
        (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE: result)
    else 
        let storage = {storage with cashPool = storage.cashPool + mutez_to_natural Tezos.amount } in
        (([] : operation list), storage)
#else
    (failwith error_TEZ_DEPOSIT_WOULD_BE_BURNED : result)
#endif

#if CASH_IS_TEZ
// set baker
let set_baker (param : set_baker) (storage : storage) : result =
    let { baker = baker ;
          freezeBaker = freezeBaker } = param in
    if storage.selfIsUpdatingPool then
      (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)    
    else if Tezos.amount > 0mutez then
       (failwith error_AMOUNT_MUST_BE_ZERO  : result)
    else if Tezos.sender <> storage.manager then
        (failwith error_ONLY_MANAGER_CAN_SET_BAKER : result)
    else if storage.freezeBaker then
        (failwith error_BAKER_PERMANENTLY_FROZEN : result)
    else
        ([ Tezos.set_delegate baker ], {storage with freezeBaker = freezeBaker})

// set manager
let set_manager (new_manager : address) (storage : storage) : result =
    if storage.selfIsUpdatingPool then
      (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else if Tezos.sender <> storage.manager then
        (failwith error_ONLY_MANAGER_CAN_SET_MANAGER : result)
    else
        (([] : operation list), {storage with manager = new_manager})
#endif        

// set lqt_address
let set_lqt_address (lqtAddress : address) (storage : storage) : result =
    if storage.selfIsUpdatingPool then
        (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)        
    else if Tezos.sender <> storage.manager then
        (failwith error_ONLY_MANAGER_CAN_SET_LQT_ADRESS : result)
    else if storage.lqtAddress <> ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
        (failwith error_LQT_ADDRESS_ALREADY_SET : result)
    else
        (([] : operation list), {storage with lqtAddress = lqtAddress})


let update_pools (storage : storage) : result =
    if Tezos.sender <> Tezos.source then 
        (failwith error_CALL_NOT_FROM_AN_IMPLICIT_ACCOUNT : result)
    else if Tezos.amount > 0mutez then
      (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else  
      let cfmm_update_token_pool_internal : update_token_pool_internal contract = Tezos.self "%updateTokenPoolInternal"  in
#if !CASH_IS_TEZ      
      let cfmm_update_cash_pool_internal : update_cash_pool_internal contract = Tezos.self "%updateCashPoolInternal"  in
#endif
#if TOKEN_IS_FA2
      let token_balance_of : balance_of contract = (match
        (Tezos.get_entrypoint_opt "%balance_of" storage.tokenAddress : balance_of contract option) with
        | None -> (failwith error_INVALID_FA2_TOKEN_CONTRACT_MISSING_BALANCE_OF : balance_of contract)
        | Some contract -> contract) in
      let op = Tezos.transaction ([(Tezos.self_address, storage.tokenId)], cfmm_update_token_pool_internal) 0mutez token_balance_of in
#else
      let token_get_balance : get_balance contract = (match
        (Tezos.get_entrypoint_opt "%getBalance" storage.tokenAddress : get_balance contract option) with
        | None -> (failwith error_INVALID_FA12_TOKEN_CONTRACT_MISSING_GETBALANCE : get_balance contract)
        | Some contract -> contract) in
      let op = Tezos.transaction (Tezos.self_address, cfmm_update_token_pool_internal) 0mutez token_get_balance in
#endif
      let op_list = [ op ] in
#if CASH_IS_FA12
      let cash_get_balance : get_balance contract = (match
        (Tezos.get_entrypoint_opt "%getBalance" storage.cashAddress : get_balance contract option) with
        | None -> (failwith error_INVALID_FA12_CASH_CONTRACT_MISSING_GETBALANCE : get_balance contract)
        | Some contract -> contract) in
      let op_cash = Tezos.transaction (Tezos.self_address, cfmm_update_cash_pool_internal) 0mutez cash_get_balance in
      let op_list = op_cash :: op_list in
#endif      
#if CASH_IS_FA2
      let cash_balance_of : balance_of contract = (match
        (Tezos.get_entrypoint_opt "%balance_of" storage.cashAddress : balance_of contract option) with
        | None -> (failwith error_INVALID_FA2_CASH_CONTRACT_MISSING_GETBALANCE : balance_of contract)
        | Some contract -> contract) in
      let op_cash = Tezos.transaction ([(Tezos.self_address, storage.cashId)], cfmm_update_cash_pool_internal) 0mutez cash_balance_of in
      let op_list = op_cash :: op_list in
#endif
      (op_list, {storage with selfIsUpdatingPool = true})


let update_fa12_pool_internal (pool_update : update_fa12_pool) : nat =
    pool_update

let update_fa2_pool_internal (pool_update : update_fa2_pool) : nat =
        // TODO should we go ahead and validate the param even though it shouldn't matter?
        match pool_update with
        | [] -> (failwith "TODO" : nat)
        | x :: xs -> x.1

let update_token_pool_internal (pool_update : update_token_pool_internal) (storage : storage) : result = 
    if (not storage.selfIsUpdatingPool or Tezos.sender <> storage.tokenAddress) then
      (failwith error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_TOKENADDRESS : result)
    else 
#if TOKEN_IS_FA2
    let pool = update_fa2_pool_internal (pool_update) in 
#else
    let pool = update_fa12_pool_internal (pool_update) in 
#endif
    (([] : operation list), {storage with tokenPool = pool})

#if !CASH_IS_TEZ
let update_cash_pool_internal (pool_update : update_cash_pool_internal) (storage : storage) : result = 
    if (not storage.selfIsUpdatingPool or Tezos.sender <> storage.cashAddress) then
      (failwith error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_CASHADDRESS : result)
    else 
#if CASH_IS_FA2
    let pool = update_fa2_pool_internal (pool_update) in 
#else
    let pool = update_fa12_pool_internal (pool_update) in 
#endif
    (([] : operation list), {storage with cashPool = pool})
#endif    
    
let token_to_token (param : token_to_token) (storage : storage) : result =
    let { outputDexterContract = outputDexterContract ;
          minTokensBought = minTokensBought ;
          to_ = to_ ;
          tokensSold = tokensSold ;
          deadline = deadline } = param in

    let outputDexterContract_contract: cash_to_token contract =
        (match (Tezos.get_entrypoint_opt "%cashToToken" outputDexterContract : cash_to_token contract option) with
            | None -> (failwith error_INVALID_INTERMEDIATE_CONTRACT :  cash_to_token contract)
            | Some c -> c) in
  
    if storage.selfIsUpdatingPool then
      (failwith error_SELF_IS_UPDATING_POOL_MUST_BE_FALSE : result)
    else if Tezos.amount > 0mutez then
      (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else 
        let cash_bought = ((tokensSold * 997n * storage.cashPool) / (storage.tokenPool * 1000n + (tokensSold * 997n)))  in
        let new_cashPool = match is_nat (storage.cashPool - cash_bought) with
            | None -> (failwith "TODO" : nat)
            | Some n -> n in
        let storage = {storage with tokenPool = storage.tokenPool + tokensSold ;
                                    cashPool = new_cashPool }  in

#if CASH_IS_TEZ
        let op_send_cash_to_output = Tezos.transaction { minTokensBought = minTokensBought ;
                                      deadline = deadline; to_ = to_ }
                                      (natural_to_mutez cash_bought)
                                      outputDexterContract_contract in        
#else
        let allow_output_to_withdraw_cash = 
#if CASH_IS_FA12
            let cashContract_approve =  (match (Tezos.get_entrypoint_opt "%approve" storage.cashAddress : (address * nat) contract option) with
                | None -> (failwith error_MISSING_APPROVE_ENTRYPOINT_IN_CASH_CONTRACT : (address * nat) contract)
                | Some c -> c) in
            (Tezos.transaction (Tezos.self_address, 0n) 
                          0mutez
                          cashContract_approve,
            Tezos.transaction (Tezos.self_address, cash_bought) 
                          0mutez
                          cashContract_approve) in
#else 
        (failwith "unsupported" : operation * operation) in // possible solution: move funds to a dedicated contract with an infinite allowance
#endif
        let op_send_cash_to_output = Tezos.transaction { minTokensBought = minTokensBought ;        
                                      cashSold = cash_bought ;
                                      deadline = deadline ; to_ = to_}
                                      0mutez
                                      outputDexterContract_contract in
#endif
        let op_accept_token_from_sender = token_transfer storage Tezos.sender Tezos.self_address tokensSold in
        ([
#if !CASH_IS_TEZ            
    allow_output_to_withdraw_cash.0 ; allow_output_to_withdraw_cash.1 ;
#endif    
        op_send_cash_to_output; op_accept_token_from_sender] , storage)

// =============================================================================
// Main
// =============================================================================

let main ((entrypoint, storage) : entrypoint * storage) : result = 
    match entrypoint with
    | AddLiquidity param ->
        add_liquidity param storage
    | RemoveLiquidity param ->
        remove_liquidity param storage
#if CASH_IS_TEZ
    | SetBaker param ->
        set_baker param storage
    | SetManager param ->
        set_manager param storage
    | Default ->
        default_ storage
#else
    | UpdateCashPoolInternal cash_pool ->
        update_cash_pool_internal cash_pool storage
#endif
    | UpdatePools  ->
        update_pools storage
    | CashToToken param ->
        cash_to_token param storage
    | TokenToCash param ->
        token_to_cash param storage
    | TokenToToken param ->
        token_to_token param storage
    | UpdateTokenPoolInternal token_pool ->
        update_token_pool_internal token_pool storage
    | SetLqtAddress param ->
        set_lqt_address param storage
