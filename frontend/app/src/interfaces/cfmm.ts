export interface AddLiquidityParams {
  owner: string;
  deadline: Date;
  minLqtMinted: number;
  maxTokensDeposited: number;
}

export interface RemoveLiquidityParams {
  to: string;
  deadline: Date;
  lqtBurned: number;
  minTokensWithdrawn: number;
  minCashWithdrawn: number;
}

export interface CashToTokenParams {
  to: string;
  minTokensBought: number;
  deadline: Date;
  // cashSold: number; # For !CASH_IS_TEZ
}

export interface TokenToCashParams {
  to: string;
  tokensSold: number;
  minCashBought: number;
  deadline: Date;
}

export interface TokenToTokenParams {
  outputCfmmContract: string;
  minTokensBought: number;
  to: string;
  tokensSold: number;
  deadline: Date;
}
