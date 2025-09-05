export interface CtezStatsGql {
  id: string;
  timestamp: string;
  current_avg_price: number;
  target_price: number;
  annual_drift_percent: number;
  ctez_sell_price: number;
  ctez_buy_price: number;
}

export interface OvenTvlGql {
  id: string;
  tvl: number;
  timestamp: string;
}

export interface OvenDonutGql {
  ctez_outstanding: number;
  address: string;
  fee_index: number;
}

export interface OvensSummaryGql {
  collateral_locked: number;
  collateral_ratio: number;
  created: number;
  liquidated: number;
  total: number;
  total_debt: number;
}

export interface OvenTransactionDtoGql {
  account: string;
  amount: string;
  id: string;
  oven: {
    address: string;
  };
  price_history: {
    target_price: number;
    timestamp: string;
  };
  transaction_hash: string;
}

export interface OvenTransactionGql {
  account: string;
  amount: string;
  id: string;
  oven_address: string;
  target_price: number;
  timestamp: string;
  transaction_hash: string;
}

export interface TradeVolumeGql {
  id: string;
  volume_usd: number;
  timestamp: string;
}

export interface AmmTvlGql {
  id: string;
  tvl: number;
  timestamp: string;
}

export interface SwapTransactionsGql {
  id: string;
  account: string;
  amount_ctez: number;
  amount_xtz: number;
  direction: 'ctez_to_tez' | 'tez_to_ctez';
  price: number;
  timestamp: string;
  transaction_hash: string;
}

export interface AddLiquidityTransactionsDto {
  account: string;
  dex: 'sell_ctez' | 'sell_tez';
  self_amount: string;
  id: string;
  price_history: {
    timestamp: string;
  },
  transaction_hash: string;
}

export interface AddLiquidityTransactionsGql {
  account: string;
  dex: 'sell_ctez' | 'sell_tez';
  self_amount: string;
  id: string;
  timestamp: string;
  transaction_hash: string;
}

export interface RemoveLiquidityTransactionsDto {
  account: string;
  dex: 'sell_ctez' | 'sell_tez';
  self_redeemed: string;
  event: {
    self_redeemed: string;
    proceeds_redeemed: string;
    subsidy_redeemed: string;
  },
  id: string;
  price_history: {
    timestamp: string;
  },
  transaction_hash: string;
}

export interface RemoveLiquidityTransactionsGql {
  account: string;
  dex: 'sell_ctez' | 'sell_tez';
  self_redeemed: string;
  proceeds_redeemed: string;
  subsidy_redeemed: string;
  id: string;
  timestamp: string;
  transaction_hash: string;
}

export interface CollectFromLiquidityTransactionsDto {
  account: string;
  dex: 'sell_ctez' | 'sell_tez';
  event: {
    proceeds_redeemed: string;
    subsidy_redeemed: string;
  },
  id: string;
  price_history: {
    timestamp: string;
  },
  transaction_hash: string;
}

export interface CollectFromLiquidityTransactionsGql {
  account: string;
  dex: 'sell_ctez' | 'sell_tez';
  proceeds_withdrawn: string;
  subsidy_withdrawn: string;
  id: string;
  timestamp: string;
  transaction_hash: string;
}
