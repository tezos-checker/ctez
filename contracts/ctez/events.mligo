type remove_liquidity = {
  id: nat; 
  self_redeemed: nat;
  proceeds_redeemed: nat;
  subsidy_redeemed: nat;
  is_sell_ctez_dex: bool;
}

let create_remove_liquidity_event_op
    (p: remove_liquidity)
    : operation =
  Tezos.emit "%remove_liquidity" p


type collect_from_liquidity = { 
  id: nat; 
  proceeds_redeemed: nat;
  subsidy_redeemed: nat;
  is_sell_ctez_dex: bool;
}

let create_collect_from_liquidity_event_op
    (p: collect_from_liquidity)
    : operation =
  Tezos.emit "%collect_from_liquidity" p
