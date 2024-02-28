type add_tez_liquidity = 
[@layout:comb]
{
    owner : address ; (* address that will own the liqudity *)
    minLiquidity : nat ; (* minimum amount of liquidity to add *)
    deadline : timestamp ; (* deadline for the transaction *)
}

type add_ctez_liquidity = 
[@layout:comb]
{
    owner : address ; (* address that will own the liqudity *)
    minLiquidity : nat ; (* minimum amount of liquidity to add *)
    deadline : timestamp ; (* deadline for the transaction *)
    ctezDeposited : nat ; (* amount of ctez to deposit *)
}

type remove_tez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to receive to *)
    lpt : nat ; (* amount of liquidity to remove *)
    minTezReceived : nat ; (* minimum amount of tez to receive *)
    minCtezReceived : nat ; (* minimum amount of ctez to receive *)
    mintSubsidyReceived : nat ; (* minimum amount of ctez subsidy to receive *)
    deadline : timestamp ; (* deadline for the transaction *)
}

type remove_ctez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to receive to *)
    lpt : nat ; (* amount of liquidity to remove *)
    minTezReceived : nat ; (* minimum amount of tez to receive *)
    minCtezReceived : nat ; (* minimum amount of ctez to receive *)
    mintSubsidyReceived : nat ; (* minimum amount of ctez subsidy to receive *)
    deadline : timestamp ; (* deadline for the transaction *)
}

type tez_to_ctez = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address that will own the ctez *)
    deadline : timestamp ; (* deadline for the transaction *)
    minCtezBought : nat ; (* minimum amount of ctez to buy *)    
}

type ctez_to_tez = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address that will own the tez *)
    deadline : timestamp ; (* deadline for the transaction *)
    minTezBought : nat ; (* minimum amount of tez to buy *)    
}

type withdraw_for_tez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to withdraw to *)
}

type withdraw_for_ctez_liquidity = 
[@layout:comb]
{
    [@annot:to] to_: address ; (* address to withdraw to, note that here you receive both ctez and tez 
    because ctez is received as part of the subsidy *)
}

type liquidity_owner = 
[@layout:comb]
{
    lpt : nat ; (* LP token amount *)
    owed : nat ; (* amount of the proceeds token owed to the contract *)
    subsidy_owed : nat ; (* amount of ctez subsidy owed to the contract *)
}


type half_dex = 
[@layout:comb]
{
    liquidity_owners : (address, liquidity_owner) big_map ; (* map of liquidity owners *)
    total_lpt : nat  ; (* total amount of liquidity tokens *)
    total_liquidity : nat ; (* total amount of liquidity *)
    total_proceeds : nat ; (* total amount accumulated from proceeds *)
    total_subsidy : nat ; (* total amount accumulated from subsidy *)
}

type storage = 
[@layout:comb]
{
    sell_ctez : half_dex ;
    sell_tez  : half_dex ;
    target : nat ; (* target / 2^48 is the target price of ctez in tez *) (* todo, logic for update *)
    Q : nat ; (* Q is the desired quantity of ctez in the ctez half dex,
     floor(Q * target) is the desired quantity of tez in the tez half dex *)
}

[@inline]
let ceildiv (numerator : nat) (denominator : nat) : nat = abs ((- numerator) / (int denominator))


[@entry]
let add_ctez_liquidity (param : add_ctez_liquidity) (s : storage) : storage * operation list =
  let d_lpt = (param.ctezDeposited * s.sell_ctez.total_lpt) / s.sell_ctez.total_liquidity in
  if d_lpt < param.minLiquidity then
    failwith "transaction would create insufficient liquidity"
  else if Tezos.get_now () > param.deadline then
    failwith "deadline has passed"
  else
    // lpt is going to be lpt + d_lpt
    // ctez is going to be ctez + d_ctez
    // if the owner already has liquidity, we need to update the owed amount
    // otherwise we need to create a new liquidity owner
    let liquidity_owner = match Big_map.find_opt param.owner s.sell_ctez.liquidity_owners with
    | None -> {owner : param.owner ; lpt : 0n ; owed : 0n ; subsidy_owed : 0n}
    | Some lo -> lo in

    let d_tez = ceildiv (sell_ctez.total_accumulated_sales * d_lpt)  sell_ctez.total_lpt in    
    let d_subsidy_owed = ceildiv (sell_ctez.total_accumulated_subsidy * d_lpt) sell_ctez.total_lpt in
    
    let liquidity_owner = { liquidity_owner with
        lpt  = liquidity_owner.lpt + d_lpt ;
        owed = liquidity_owner.owed + d_tez ;
        subsidy_owed = liquidityowner.subsidy_owed + d_subsidy_owed } in

    let liquidity_owners = Big_map.update param.owner (Some liquidity_owner) liquidity_owners in
    
    let sell_ctez = {s.sell_ctez with
        liquidity_owners = liquidity_owners ;
        total_lpt = s.sell_ctez.total_lpt + d_lpt ;
        total_liquidity = s.sell_ctez.total_liquidity + param.ctezDeposited ;
        } in

    let receive_ctez = Tezos.transaction (param.owner, (s.liquidity_dex_address, params.ctezDeposited)) 0mutez s.ctez_token_contract in
    ({s with sell_ctez = half_dex}, [receive_ctez])
    
[@entry]
let remove_ctez_liquidity (param : remove_ctez_liquidity) (s : storage) : storage * operation list = 
    if Tezos.get_now () > param.deadline then
        failwith "deadline has passed"
    else
        let ctez_removed = (param.lpt * s.sell_ctez.total_liquidity) / s.sell_ctez.total_lpt in
        let tez_removed = (param.lpt * s.sell_ctez.total_accumulated_sales) / s.sell_ctez.total_lpt in
        let subsidy_removed = (param.lpt * s.sell_ctez.total_accumulated_subsidy) / s.sell_ctez.total_lpt in
        let liquidity_owner = match Big_map.find_opt param.owner s.sell_ctez.liquidity_owners with
        | None -> failwith "no liquidity owner"
        | Some lo -> lo in
        if liquidity_owner.lpt < param.lpt then
            failwith "insufficient liquidity"
        else if ctez_removed < param.minCtezReceived then
            failwith "insufficient ctez would be received"
        else
            (* compute the amount of tez to receive after netting the owed amount *)
            let tez_to_receive = tez_removed - liquidity_owner.owed in
            if tez_to_receive < param.minTezReceived then
                failwith "insufficient tez would be received"
            else
                let (owed, tez_to_receive) =
                    if tez_to_receive < 0n then                    
                        (abs (liquidity_owner.owed - tez_removed), 0n)
                    else
                        (0n, abs tez_to_receive)
                in
                let subsidy_to_receive = subsidy_removed - liquidity_owner.subsidy_owed in
                if subsidy_to_receive < param.minSubsidyReceived then
                    failwith "insufficient subsidy would be received"
                else
                    let (subsidy_owed, subsidy_to_receive) =
                        if subsidy_to_receive < 0n then
                            (abs (liquidity_owner.subsidy_owed - subsidy_removed), 0n)
                        else
                            (0n, abs subsidy_to_receive)
                    in
                    let liquidity_ower = { liquidity_owner with
                        lpt = abs (liquidity_owner.lpt - param.lpt) ;
                        owed = owed ;
                        subsidy_owed = subsidy_owed } in
                    let liquidity_owners = Big_map.update param.owner (Some liquidity_owner) s.sell_ctez.liquidity_owners in
                    let sell_ctez = {s.sell_ctez with
                        liquidity_owners = liquidity_owners ;
                        total_lpt = abs (s.sell_ctez.total_lpt - param.lpt) ;
                        total_liquidity = abs (s.sell_ctez.total_liquidity - ctez_removed) ;
                        total_accumulated_sales = s.sell_ctez.total_accumulated_sales - tez_removed ;
                        total_accumulated_subsidy = s.sell_ctez.total_accumulated_subsidy - subsidy_removed ;
                    } in
                    let receive_ctez = Tezos.transaction (param.to_, (s.ctez_token_contract, ctez_removed)) 0mutez s.liquidity_dex_address in
                    let receive_subsidy = Tezos.transaction (param.to_, (s.ctez_token_contract, subsidy_to_receive)) 0mutez s.liquidity_dex_address in
                    let receive_tez = Tezos.transaction () (tez_to_receive * 1mutez) param.to_ in
                    ({s with sell_ctez = sell_ctez}, [receive_ctez; receive_subsidy; receive_tez])

