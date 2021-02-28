// TODO for tickets
// basically allow  ticket_to_token, token_to_ticket, but also fa12_to_token and token_to_fa12 so that people can participate more easily. The token_to_ticket and ticket_to_token entrypoints
// can be used specifically for the token_to_token calls
// try to see how much code can be shared in  say fa12_to_token and ticket_to_token

// =============================================================================
// Entrypoints
// =============================================================================

type add_liquidity =
  [@layout:comb]
  { tezDeposited : nat ticket ;      
    owner : address ;
    minLqtMinted : nat ;
    maxTokensDeposited : nat ;
    deadline : timestamp ;
  }

type remove_liquidity =
  [@layout:comb]
  { [@annot:to] to_ : address ; // recipient of the liquidity redemption
    lqtBurned : nat ;  // amount of lqt owned by sender to burn
    minTezWithdrawn : nat ; // minimum amount of tez to withdraw
    minTokensWithdrawn : nat ; // minimum amount of tokens to whitdw
    deadline : timestamp ; // the time before which the request must be completed
  }

type tez_to_token =
  [@layout:comb]
  { tez : nat ticket ;
    [@annot:to] to_ : address ;
    minTokensBought : nat ;
    deadline : timestamp ;
  }

type token_to_tez =
  [@layout:comb]
  { [@annot:to] to_ : address ;
    tokensSold : nat ;
    minTezBought : tez ;
    deadline : timestamp ;
  }

type token_to_token =
  [@layout:comb]
  { outputDexterContract : address ;
    minTokensBought : nat ;
    [@annot:to] to_ : address ;
    tokensSold : nat ;
    deadline : timestamp ;
  }

#if FA2
type update_token_pool_internal = ((address * nat) * nat) list
#else
type update_token_pool_internal = nat
#endif

type entrypoint =
| AddLiquidity    of add_liquidity
| RemoveLiquidity of remove_liquidity
| TezToToken      of tez_to_token
| TokenToTez      of token_to_tez
| SetLqtAddress   of address
| Default         of unit
| UpdateTokenPool of unit
| UpdateTokenPoolInternal of update_token_pool_internal
| TokenToToken    of token_to_token

// =============================================================================
// Storage
// =============================================================================
type storage_without_ticket = 
  [@layout:comb]
  { tokenPool : nat ;
    lqtTotal : nat ;
    selfIsUpdatingTokenPool : bool ;
    tokenAddress : address ;
#if FA2
    tokenId : nat ;
#endif
    lqtAddress : address ;
    ticketer : address ;
    ticketId : nat;
  }

type storage = 
  [@layout:comb]
  { tezPoolTicket : nat ticket ;
    storage : storage_without_ticket}
   

// =============================================================================
// Type Synonyms
// =============================================================================

type result = operation list * storage

#if FA2
// FA2
type token_id = nat
type token_contract_transfer = (address * (address * (token_id * nat)) list) list
type balance_of = ((address * token_id) list * ((((address * nat) * nat) list) contract))
#else
// FA1.2
type token_contract_transfer = address * (address * nat)
type get_balance = address * (nat contract)
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
(* 1n *)
[@inline] let error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE       = 2n
[@inline] let error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE = 3n
[@inline] let error_MAX_TOKENS_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_TOKENS_DEPOSITED = 4n
[@inline] let error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED = 5n
(* 6n *)
(* 7n *)
[@inline] let error_TEZ_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TEZ_BOUGHT = 8n
[@inline] let error_INVALID_TO_ADDRESS = 9n
[@inline] let error_AMOUNT_MUST_BE_ZERO = 10n
[@inline] let error_THE_AMOUNT_OF_TEZ_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TEZ_WITHDRAWN = 11n
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
#if FA2
[@inline] let error_INVALID_FA2_TOKEN_CONTRACT_MISSING_BALANCE_OF = 28n
#else
[@inline] let error_INVALID_FA12_TOKEN_CONTRACT_MISSING_GETBALANCE = 28n
#endif
[@inline] let error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_TOKENADDRESS = 29n
(* 30n *)
[@inline] let error_INVALID_INTERMEDIATE_CONTRACT = 31n
[@inline] let error_INVALID_FA2_BALANCE_RESPONSE = 32n


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

let ceildiv (numerator : nat) (denominator : nat) : nat =
    match (ediv numerator denominator) with
        | None   -> (failwith("DIV by 0") : nat)
        | Some v ->  let (q, r) = v in if r = 0n then q else q + 1n

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
#if FA2
    Tezos.transaction [(from, [(to_, (storage.tokenId, token_amount))])] 0mutez token_contract
#else
    Tezos.transaction (from, (to_, token_amount)) 0mutez token_contract
#endif

[@inline]
let tez_transfer (s : storage) (to_ : address) (amount_ : nat) : operation * storage = 
    let to_contract : (nat ticket) contract =
    match (Tezos.get_contract_opt to_ : (nat ticket) contract option) with
    | None -> (failwith error_INVALID_TO_ADDRESS : (nat ticket) contract)
    | Some c -> c in
    let { tezPoolTicket = tezPoolTicket ; storage = storage } = s in 
    match tezPoolTicket with
    | None -> (failwith error_NO_TEZ_STORED : operation)
    | Some tezPoolTicket -> let ((_, (_, bal)), tezPoolTicket) = Tezos.read_ticket tezPoolTicket in
    let (tezPoolTicket, sent) = Tezos.split_ticket tezPoolTicket (abs (bal - amount_)) amount in
    (Tezos.transaction sent 0mutez to_contract,  {tezPoolTicket = tezPoolTicket ; storage = storage})

type get_and_merge_tez =  storage * nat * nat

[@inline]
let get_and_merge_tez (s : storage) (received : nat ticket) : get_and_merge_tez = 
    let ((ticketer_received, (id, amount_)), received) = Tezos.read_ticket received in
    if ticketer_received <> storage.ticketer then
        (failwith error_INVALID_TICKETER : get_and_merge_tez)
    else if id <> storage.ticketId then
        (failwith error_INVALID_TICKET_ID : get_and_merge_tez)
    else begin
        let { tezPoolTicket = tezPoolTicket ; storage = storage} = s in 
        match tezPoolTicket with 
        | None -> ({ tezPoolTicket = Some received ; storage = storage }, amount_, 0)
        | Some ticket ->
            let ((_, (_, pool)), ticket) = Tezos.read_ticket ticket in 
            ({tezPoolTicket = Tezos.join_tickets (received, ticker) ; storage = storage }, amount_, pool)
    end

// =============================================================================
// Entrypoint Functions
// =============================================================================

// We assume the contract is originated with at least one liquidity
// provider set up already, so lqtTotal, tezPool and tokenPool will
// always be positive after the initial setup, unless all liquidity is
// removed, at which point the contract is considered dead and stops working
// properly. (To prevent this, at least one address should keep at least a
// small amount of liquidity in the contract forever.)

let add_liquidity (param : add_liquidity) (s: storage) : result =
    let { tezDeposited = tezDeposited ;
          owner = owner ;
          minLqtMinted = minLqtMinted ;
          maxTokensDeposited = maxTokensDeposited ;
          deadline = deadline } = param in            
    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else
        // the contract is initialized, use the existing exchange rate
        // mints nothing if the contract has been emptied, but that's OK
    let ({ tezPoolTicket = tezPoolTicket ; storage = storage }, nat_amount, tezPool) = get_and_merge_tez s tezDeposited in
        let lqt_minted : nat = nat_amount * storage.lqtTotal  / tezPool in
        let tokens_deposited : nat = ceildiv (nat_amount * storage.tokenPool) tezPool in

        if tokens_deposited > maxTokensDeposited then
            (failwith error_MAX_TOKENS_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_TOKENS_DEPOSITED : result)
        else if lqt_minted < minLqtMinted then
            (failwith error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED : result)
        else
            let storage = {storage with
                lqtTotal  = storage.lqtTotal + lqt_minted ;
                tokenPool = storage.tokenPool + tokens_deposited} in
            // send tokens from sender to exchange
            let op_token = token_transfer storage Tezos.sender Tezos.self_address tokens_deposited in
            // mint lqt tokens for them
            let op_lqt = mint_or_burn storage owner (int lqt_minted) in
            ([op_token; op_lqt], { tezPoolTicket = TezPoolTicket ; storage = storage })

let remove_liquidity (param : remove_liquidity) (storage : storage) : result =
    let { to_ = to_ ;
          lqtBurned = lqtBurned ;
          minTezWithdrawn = minTezWithdrawn ;
          minTokensWithdrawn = minTokensWithdrawn ;
          deadline = deadline } = param in    

    if storage.selfIsUpdatingTokenPool then
      (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else begin
        let tez_withdrawn    : tez = natural_to_mutez ((lqtBurned * (mutez_to_natural storage.tezPool)) / storage.lqtTotal) in
        let tokens_withdrawn : nat = lqtBurned * storage.tokenPool /  storage.lqtTotal in

        // Check that minimum withdrawal conditions are met
        if tez_withdrawn < minTezWithdrawn then
            (failwith error_THE_AMOUNT_OF_TEZ_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TEZ_WITHDRAWN : result)
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
                                
            let op_lqt = mint_or_burn storage Tezos.sender (0 - lqtBurned) in
            let op_token = token_transfer storage Tezos.self_address to_ tokens_withdrawn in 
            
            let (tezPool, sent) = Tezos.split_ticket storage.tezPool  
            let op_tez = tez_transfer to_ tez_withdrawn in
            let storage = {storage with tezPool = storage.tezPool - tez_withdrawn ; lqtTotal = new_lqtTotal ; tokenPool = new_tokenPool} in
            ([op_lqt; op_token; op_tez], storage)
        end
    end


let tez_to_token (param : tez_to_token) (storage : storage) =
   let { to_ = to_ ;
         minTokensBought = minTokensBought ;
         deadline = deadline } = param in

    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else begin
        // we don't check that tezPool > 0, because that is impossible
        // unless all liquidity has been removed
        let tezPool = mutez_to_natural storage.tezPool in
        let nat_amount = mutez_to_natural Tezos.amount in
        let tokens_bought = 
            (let bought = (nat_amount * 997n * storage.tokenPool) / (tezPool * 1000n + (nat_amount * 997n)) in
            if bought < minTokensBought then
                (failwith error_TOKENS_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_BOUGHT : nat)
            else
                bought)
        in    
        let new_tokenPool = (match is_nat (storage.tokenPool - tokens_bought) with
            | None -> (failwith error_TOKEN_POOL_MINUS_TOKENS_BOUGHT_IS_NEGATIVE : nat)
            | Some difference -> difference) in

        // update tezPool
        let storage = { storage with tezPool = storage.tezPool + Tezos.amount ; tokenPool = new_tokenPool } in
        // send tokens_withdrawn to to address
        // if tokens_bought is greater than storage.tokenPool, this will fail
        let op = token_transfer storage Tezos.self_address to_ tokens_bought in
        ([ op ], storage)
    end


let token_to_tez (param : token_to_tez) (storage : storage) =
    let { to_ = to_ ;
          tokensSold = tokensSold ;
          minTezBought = minTezBought ;
          deadline = deadline } = param in

    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else
        // we don't check that tokenPool > 0, because that is impossible
        // unless all liquidity has been removed
        let tez_bought = 
            let bought = natural_to_mutez (((tokensSold * 997n * (mutez_to_natural storage.tezPool)) / (storage.tokenPool * 1000n + (tokensSold * 997n)))) in
                if bought < minTezBought then (failwith error_TEZ_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TEZ_BOUGHT : tez) else bought in

        let op_token = token_transfer storage Tezos.sender Tezos.self_address tokensSold in
        let op_tez = tez_transfer to_ tez_bought in
        let storage = {storage with tokenPool = storage.tokenPool + tokensSold ;
                                    tezPool = storage.tezPool - tez_bought} in
        ([op_tez ; op_token], storage)

// set lqt_address
let set_lqt_address (lqtAddress : address) (storage : storage) : result =
    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)    
    else if storage.lqtAddress <> ("tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU" : address) then
        (failwith error_LQT_ADDRESS_ALREADY_SET : result)
    else
        (([] : operation list), {storage with lqtAddress = lqtAddress})


let update_token_pool (storage : storage) : result =
    if Tezos.sender <> Tezos.source then 
        (failwith error_CALL_NOT_FROM_AN_IMPLICIT_ACCOUNT : result)
    else if Tezos.amount > 0mutez then
      (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else  
      let cfmm_update_token_pool_internal : update_token_pool_internal contract = Tezos.self "%updateTokenPoolInternal"  in
#if FA2
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
      ([ op ], {storage with selfIsUpdatingTokenPool = true})

let update_token_pool_internal (token_pool : update_token_pool_internal) (storage : storage) : result =
    if (not storage.selfIsUpdatingTokenPool or sender <> storage.tokenAddress) then
      (failwith error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_TOKENADDRESS : result)
    else 
#if FA2
        // we trust the FA2 to provide the expected balance. there are no BFS
        // shenanigans to worry about unless the token contract misbehaves
        let token_pool =
          match token_pool with
          | [] -> (failwith error_INVALID_FA2_BALANCE_RESPONSE : nat)
          | x :: xs -> x.1 in
#endif
        let storage = {storage with tokenPool = token_pool ; selfIsUpdatingTokenPool = false} in
        (([ ] : operation list), storage)

let token_to_token (param : token_to_token) (storage : storage) : result =
    let { outputDexterContract = outputDexterContract ;
          minTokensBought = minTokensBought ;
          to_ = to_ ;
          tokensSold = tokensSold ;
          deadline = deadline } = param in

    let outputDexterContract_contract: (address * nat * timestamp) contract =
        (match (Tezos.get_entrypoint_opt "%tezToToken" outputDexterContract : (address * nat * timestamp) contract option) with
            | None -> (failwith error_INVALID_INTERMEDIATE_CONTRACT :  (address * nat * timestamp) contract)
            | Some c -> c) in
  
    if storage.selfIsUpdatingTokenPool then
      (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.amount > 0mutez then
      (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else 
        // we don't check that tokenPool > 0, because that is impossible unless all liquidity has been removed
        let tez_bought = natural_to_mutez (((tokensSold * 997n * storage.tezPool) / natural_to_mutez(storage.tokenPool * 1000n + (tokensSold * 997n)))) in
        let storage = {storage with tokenPool = storage.tokenPool + tokensSold ; tezPool = storage.tezPool - tez_bought}  in
        
        let op1 = token_transfer storage Tezos.sender Tezos.self_address tokensSold in
        let op2 = Tezos.transaction (to_, minTokensBought, deadline) tez_bought outputDexterContract_contract in
        ([op1; op2] , storage)

// =============================================================================
// Main
// =============================================================================

let main ((entrypoint, storage) : entrypoint * storage) : result = 
    match entrypoint with
    | AddLiquidity param ->
        add_liquidity param storage
    | RemoveLiquidity param ->
        remove_liquidity param storage
    | SetLqtAddress param ->
        set_lqt_address param storage
    | UpdateTokenPool  ->
        update_token_pool storage
    | TezToToken param ->
        tez_to_token param storage
    | TokenToTez param ->
        token_to_tez param storage
    | TokenToToken param ->
        token_to_token param storage
    | UpdateTokenPoolInternal token_pool ->
        update_token_pool_internal token_pool storage
