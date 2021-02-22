(* Entrypoints *)
type add_liquidity =
  [@layout:comb]
  { owner : address ;
    minLqtMinted : nat ;
    maxTokensDeposited : nat ;
    deadline : timestamp ;
  }

type remove_liquidity =
  [@layout:comb]
  { [@annot:to] to_ : address ; (* recipient of the liquidity redemption *)
    lqtBurned : nat ;  (* amount of lqt owned by sender to burn *)
    minXtzWithdrawn : tez ; (* minimum amount of tez to withdraw *)
    minTokensWithdrawn : nat ; (* minimum amount of tokens to whitdw *)
    deadline : timestamp ; (* the time before which the request must be completed *)
  }

type xtz_to_token =
  [@layout:comb]
  { [@annot:to] to_ : address ;
    minTokensBought : nat ;
    deadline : timestamp ;
  }

type token_to_xtz =
  [@layout:comb]
  { [@annot:to] to_ : address ;
    tokensSold : nat ;
    minXtzBought : tez ;
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
| XtzToToken      of xtz_to_token
| TokenToXtz      of token_to_xtz
| SetLqtAddress   of address
| Default         of unit
| UpdateTokenPool of unit
| UpdateTokenPoolInternal of update_token_pool_internal
| TokenToToken    of token_to_token


(* Storage *)


type storage =
  [@layout:comb]
  { tokenPool : nat ;
    xtzPool : tez ;
    lqtTotal : nat ; 
    selfIsUpdatingTokenPool : bool ;
    manager : address ;
    tokenAddress : address ;
#if FA2
    tokenId : nat ;
#endif
    lqtAddress : address ;
#if ORACLE
    lastOracleUpdate : timestamp ;
#endif
  }


(*  Type Synonyms *)


type result = operation list * storage

#if FA2
(* FA2 *)
type token_id = nat
type token_contract_transfer = (address * (address * (token_id * nat)) list) list
type balance_of = ((address * token_id) list * ((((address * nat) * nat) list) contract))
#else
(* FA1.2 *)
type token_contract_transfer = address * (address * nat)
type get_balance = address * (nat contract)
#endif

(* custom entrypoint for LQT FA1.2 *)
type mintOrBurn =
  [@layout:comb]
  { quantity : int ;
    target : address }

(* Error codes *) 

[@inline] let error_TOKEN_CONTRACT_MUST_HAVE_A_TRANSFER_ENTRYPOINT  = 0n
[@inline] let error_LQT_CONTRACT_MUST_HAVE_MINT_OR_BURN_ENTRYPOINT  = 1n
[@inline] let error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE       = 2n
[@inline] let error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE = 3n
[@inline] let error_MAX_TOKENS_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_TOKENS_DEPOSITED = 4n
[@inline] let error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED = 5n
[@inline] let error_THE_AMOUNT_OF_TEZ_SENT_TO_THE_CONTRACT_MUT_BE_GREATER_THAN_ONE = 6n
[@inline] let error_XTZ_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_XTZ_BOUGHT = 7n
[@inline] let error_INVALID_TO_ADDRESS = 8n
[@inline] let error_AMOUNT_MUST_BE_ZERO = 9n
[@inline] let error_THE_AMOUNT_OF_XTZ_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_XTZ_WITHDRAWN = 10n
[@inline] let error_LQT_CONTRACT_MUST_HAVE_A_MINT_OR_BURN_ENTRYPOINT = 11n
[@inline] let error_THE_AMOUNT_OF_TOKENS_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_WITHDRAWN = 12n
[@inline] let error_CANNOT_BURN_MORE_THAN_THE_TOTAL_AMOUNT_OF_LQT = 13n
[@inline] let error_TOKEN_POOL_MINUS_TOKENS_WITHDRAWN_IS_NEGATIVE = 14n
[@inline] let error_XTZ_POOL_MUST_BE_GREATER_THAN_ZERO = 15n
[@inline] let error_TOKEN_POOL_MUST_BE_GREATER_THAN_ZERO = 16n
[@inline] let error_TOKENS_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_BOUGHT = 17n
[@inline] let error_TOKEN_POOL_MINUS_TOKENS_BOUGHT_IS_NEGATIVE = 18n
[@inline] let error_ONLY_MANAGER_CAN_SET_BAKER = 19n
[@inline] let error_ONLY_MANAGER_CAN_SET_MANAGER = 20n
[@inline] let error_BAKER_PERMANENTLY_FROZEN = 21n
[@inline] let error_ONLY_MANAGER_CAN_SET_LQT_ADRESS = 22n
[@inline] let error_LQT_ADDRESS_ALREADY_SET = 23n
[@inline] let error_CALL_NOT_FROM_AN_IMPLICIT_ACCOUNT = 24n
#if FA2
[@inline] let error_INVALID_FA2_TOKEN_CONTRACT_MISSING_BALANCE_OF = 25n
#else
[@inline] let error_INVALID_FA12_TOKEN_CONTRACT_MISSING_GETBALANCE = 25n
#endif
[@inline] let error_THIS_ENTRYPOINT_MAY_ONLY_BE_CALLED_BY_GETBALANCE_OF_TOKENADDRESS = 26n
[@inline] let error_INVALID_INTERMEDIATE_CONTRACT = 27n
#if ORACLE
[@inline] let error_CANNOT_GET_CFMM_PRICE_ENTRYPOINT_FROM_CONSUMER = 28n
#include "_build/oracle_constant.mligo" 
#endif


(* Functions *)

(* this is slightly inefficient to inline, but, nice to have a clean stack for 
   the entrypoints for the Coq verification *)
[@inline]
let mutez_to_natural (a: tez) : nat =  a / 1mutez

[@inline]
let natural_to_mutez (a: nat): tez = a * 1mutez  

[@inline]
let is_a_nat (i : int) : nat option = Michelson.is_nat i

let ceildiv ((numerator, denominator) : nat * nat) : nat =  abs ((-numerator) / int(denominator))    

(* token transfers *)
let token_transfer (tokenAddress : address) (from : address) (to_ : address) (token_amount : nat) : operation =
    let token_contract: token_contract_transfer contract =
    match (Tezos.get_entrypoint_opt "%transfer" tokenAddress : token_contract_transfer contract option) with
    | None -> (failwith error_TOKEN_CONTRACT_MUST_HAVE_A_TRANSFER_ENTRYPOINT : token_contract_transfer contract)
    | Some contract -> contract in
#if FA2
    Tezos.transaction [(from, [(to_, (storage.tokenId, token_amount))])] 0mutez token_contract
#else
    Tezos.transaction (from, (to_, token_amount)) 0mutez token_contract
#endif


(* Entrypoint Functions *)

let add_liquidity (param : add_liquidity) (storage: storage) : result =
    let { owner = owner ;
          minLqtMinted = minLqtMinted ;
          maxTokensDeposited = maxTokensDeposited ;
          deadline = deadline } = param in

    (* Get the lqt admin entrypoint *)
    let lqt_admin : mintOrBurn contract =
    match (Tezos.get_entrypoint_opt "%mintOrBurn" storage.lqtAddress :  mintOrBurn contract option) with
    | None -> (failwith error_LQT_CONTRACT_MUST_HAVE_MINT_OR_BURN_ENTRYPOINT : mintOrBurn contract)
    | Some contract -> contract in

    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else            
        (* the contract is initialized, use the existing exchange rate
           mints nothing if the contract has been emptied, but that's OK *)
        let xtzPool   : nat = mutez_to_natural storage.xtzPool in
        let nat_amount : nat = mutez_to_natural Tezos.amount  in
        let lqt_minted : nat = nat_amount * storage.lqtTotal  / xtzPool in
        let tokens_deposited : nat = ceildiv (nat_amount * storage.tokenPool, xtzPool) in

        if tokens_deposited > maxTokensDeposited then
            (failwith error_MAX_TOKENS_DEPOSITED_MUST_BE_GREATER_THAN_OR_EQUAL_TO_TOKENS_DEPOSITED : result)
        else if lqt_minted < minLqtMinted then
            (failwith error_LQT_MINTED_MUST_BE_GREATER_THAN_MIN_LQT_MINTED : result)
        else         
            let storage = {storage with 
                lqtTotal  = storage.lqtTotal + lqt_minted ;
                tokenPool = storage.tokenPool + tokens_deposited ;
                xtzPool   = storage.xtzPool + Tezos.amount} in

            (* send tokens from sender to exchange *)
            let op_token = token_transfer storage.tokenAddress Tezos.sender Tezos.self_address tokens_deposited in
            (* mint lqt tokens for them *)
            let op_lqt = Tezos.transaction {quantity = int(lqt_minted) ; target = owner} 0mutez lqt_admin in            
            ([op_token; op_lqt], storage)
        

let remove_liquidity (param : remove_liquidity) (storage : storage) : result =
    let { to_ = to_ ;
          lqtBurned = lqtBurned ;
          minXtzWithdrawn = minXtzWithdrawn ;
          minTokensWithdrawn = minTokensWithdrawn ;
          deadline = deadline } = param in

    (* Get the to contract *)
    let to_contract : unit contract = (match (Tezos.get_contract_opt to_ : unit contract option) with
        | None -> (failwith error_INVALID_TO_ADDRESS : unit contract)
        | Some c -> c) in 

    (* Get the lqt admin entrypoint *)
    let lqt_admin : mintOrBurn contract =
    match (Tezos.get_entrypoint_opt "%mintOrBurn" storage.lqtAddress :  mintOrBurn contract option) with
    | None -> (failwith error_LQT_CONTRACT_MUST_HAVE_A_MINT_OR_BURN_ENTRYPOINT : mintOrBurn contract)
    | Some contract -> contract in

    if storage.selfIsUpdatingTokenPool then
      (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else if Tezos.amount <> 0mutez then
      (failwith error_AMOUNT_MUST_BE_ZERO : result)    
    else begin       
        let xtz_withdrawn    : tez = natural_to_mutez ((lqtBurned * (mutez_to_natural storage.xtzPool)) / storage.lqtTotal) in
        let tokens_withdrawn : nat = lqtBurned * storage.tokenPool /  storage.lqtTotal in

        (* Check that minimum withdrawal conditions are met *)
        if xtz_withdrawn < minXtzWithdrawn then
            (failwith error_THE_AMOUNT_OF_XTZ_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_XTZ_WITHDRAWN : result)
        else if tokens_withdrawn < minTokensWithdrawn  then
            (failwith error_THE_AMOUNT_OF_TOKENS_WITHDRAWN_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_WITHDRAWN : result)
        (* Proceed to form the operations and update the storage *)
        else begin                                                                
           (* calculate lqtTotal, convert int to nat *)
            let new_lqtTotal = match (is_a_nat ( storage.lqtTotal - lqtBurned)) with
                (* This check should be unecessary, the fa12 logic normally takes care of it *)
                | None -> (failwith error_CANNOT_BURN_MORE_THAN_THE_TOTAL_AMOUNT_OF_LQT : nat)
                | Some n -> n in
            (* Calculate tokenPool, convert int to nat *)
            let new_tokenPool = match is_a_nat (storage.tokenPool - tokens_withdrawn) with
                | None -> (failwith error_TOKEN_POOL_MINUS_TOKENS_WITHDRAWN_IS_NEGATIVE : nat)
                | Some n -> n in
                                
            (* send burn operation to burn the lqt tokens *)
            let op_lqt =  Tezos.transaction {quantity = 0 - lqtBurned ; target = Tezos.sender} 0mutez lqt_admin in
            (* send tokens_withdrawn to to address, if tokens_withdrawn if greater than storage.tokenPool, this will fail *)
            let op_token = token_transfer storage.tokenAddress Tezos.self_address to_ tokens_withdrawn in
            (* send xtz_withdrawn to to_ address *)
            let op_xtz : operation = Tezos.transaction unit xtz_withdrawn to_contract in

            let storage = {storage with xtzPool = storage.xtzPool - xtz_withdrawn ; lqtTotal = new_lqtTotal ; tokenPool = new_tokenPool} in
            ([op_lqt; op_token; op_xtz], storage)
        end
    end


let xtz_to_token (param : xtz_to_token) (storage : storage) =
   let { to_ = to_ ;
         minTokensBought = minTokensBought ;
         deadline = deadline } = param in

    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)    
    else begin

        let xtzPool = mutez_to_natural storage.xtzPool in
        let nat_amount = mutez_to_natural Tezos.amount in
        let tokens_bought = 
            (let bought = (nat_amount * 997n * storage.tokenPool) / (xtzPool * 1000n + (nat_amount * 997n)) in
            if bought < minTokensBought then
                (failwith error_TOKENS_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_TOKENS_BOUGHT : nat)
            else
                bought)
        in    
        let new_tokenPool = (match is_nat (storage.tokenPool - tokens_bought) with
            | None -> (failwith error_TOKEN_POOL_MINUS_TOKENS_BOUGHT_IS_NEGATIVE : nat)
            | Some difference -> difference) in

        (* update xtzPool *)
        let storage = { storage with xtzPool = storage.xtzPool + Tezos.amount ; tokenPool = new_tokenPool } in
        (* send tokens_withdrawn to to address
           if tokens_bought is greater than storage.tokenPool, this will fail *)
        let op = token_transfer storage.tokenAddress Tezos.self_address to_ tokens_bought in
        ([ op ], storage)
    end


let token_to_xtz (param : token_to_xtz) (storage : storage) =
    let { to_ = to_ ;
          tokensSold = tokensSold ;
          minXtzBought = minXtzBought ;
          deadline = deadline } = param in

    (* Sanitize the input *)
    let to_contract : unit contract = (match (Tezos.get_contract_opt to_ : unit contract option) with
        | None -> (failwith error_INVALID_TO_ADDRESS : unit contract)
        | Some c -> c) in 

    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
        (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)        
    else if Tezos.amount > 0mutez then 
      (failwith error_AMOUNT_MUST_BE_ZERO : result)
    else begin
        let xtz_bought = 
            let bought = natural_to_mutez (((tokensSold * 997n * (mutez_to_natural storage.xtzPool)) / (storage.tokenPool * 1000n + (tokensSold * 997n)))) in
                if bought < minXtzBought then (failwith error_XTZ_BOUGHT_MUST_BE_GREATER_THAN_OR_EQUAL_TO_MIN_XTZ_BOUGHT : tez) else bought in

        let storage = {storage with tokenPool = storage.tokenPool + tokensSold ; xtzPool = storage.xtzPool - xtz_bought} in
        
        (* send tokensSold to the exchange address *)
        let  op_token = token_transfer storage.tokenAddress Tezos.sender Tezos.self_address tokensSold in
        (* send xtz_bought to to_ address *)
        let  op_tez: operation = Tezos.transaction unit xtz_bought to_contract in
        ([op_tez ; op_token], storage)
    end


(* entrypoint to allow depositing funds *)
let default_ (storage : storage) : result = 
    (* update xtzPool *)
    if (storage.selfIsUpdatingTokenPool) then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE: result)
    else 
        let storage = {storage with xtzPool = storage.xtzPool + amount } in
        (([] : operation list), storage)

(* set lqt_address *)
let set_lqt_address (lqtAddress : address) (storage : storage) : result =
    if storage.selfIsUpdatingTokenPool then
        (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
     else if Tezos.amount > 0mutez then
        (failwith error_AMOUNT_MUST_BE_ZERO : result)        
    else if Tezos.sender <> storage.manager then
        (failwith error_ONLY_MANAGER_CAN_SET_LQT_ADRESS : result)    
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
      (* TODO probably should go ahead and validate rest of param even though it shouldn't matter *)
#if FA2
        let token_pool =
          match token_pool with
          | [] -> (failwith "TODO" : nat)
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
        (match (Tezos.get_entrypoint_opt "%xtzToToken" outputDexterContract : (address * nat * timestamp) contract option) with
            | None -> (failwith error_INVALID_INTERMEDIATE_CONTRACT :  (address * nat * timestamp) contract)
            | Some c -> c) in
  
    if storage.selfIsUpdatingTokenPool then
      (failwith error_SELF_IS_UPDATING_TOKEN_POOL_MUST_BE_FALSE : result)
    else if Tezos.now >= deadline then
      (failwith error_THE_CURRENT_TIME_MUST_BE_LESS_THAN_THE_DEADLINE : result)
    else 
        let xtz_bought = natural_to_mutez (((tokensSold * 997n * storage.xtzPool) / natural_to_mutez(storage.tokenPool * 1000n + (tokensSold * 997n)))) in
        let storage = {storage with tokenPool = storage.tokenPool + tokensSold ; xtzPool = storage.xtzPool - xtz_bought}  in
        
        (* send xtz_bought to to_ address *)
        let op1 = Tezos.transaction (to_, minTokensBought, deadline)  xtz_bought outputDexterContract_contract in
        (* send tokensSold to the exchange address *)
        let op2 = token_transfer storage.tokenAddress Tezos.sender Tezos.self_address tokensSold in
        ([op1; op2] , storage)

#if ORACLE

let update_consumer (operations, storage : result) : result =
    if storage.lastOracleUpdate = Tezos.now
        then (operations, storage)
    else 
        let consumer = match (Tezos.get_entrypoint_opt "%cfmm_price" const_CONSUMER_ADDRESS : ((tez * nat) contract) option) with
        | None -> (failwith error_CANNOT_GET_CFMM_PRICE_ENTRYPOINT_FROM_CONSUMER : (tez * nat) contract)
        | Some c -> c in
        ((Tezos.transaction (storage.xtzPool, storage.tokenPool) 0mutez consumer) :: operations,
        {storage with lastOracleUpdate = Tezos.now})
#endif 

       
(* Main *)

let main ((entrypoint, storage) : entrypoint * storage) : result = 
    match entrypoint with
    | AddLiquidity param ->
        add_liquidity param storage
    | RemoveLiquidity param ->
        remove_liquidity param storage
    | SetLqtAddress param ->
        set_lqt_address param storage
    | Default ->
        default_ storage
    | UpdateTokenPool  ->
        update_token_pool storage
    | XtzToToken param ->        
#if ORACLE
        update_consumer
#endif
        (xtz_to_token param storage)
    | TokenToXtz param ->
#if ORACLE
        update_consumer
#endif
        (token_to_xtz param storage)
    | TokenToToken param ->
#if ORACLE
        update_consumer
#endif    
        (token_to_token param storage)
    | UpdateTokenPoolInternal token_pool ->
        update_token_pool_internal token_pool storage
