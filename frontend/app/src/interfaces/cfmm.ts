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
