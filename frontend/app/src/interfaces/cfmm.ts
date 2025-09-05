import BigNumber from 'bignumber.js';

export interface AddLiquidityParams {
  owner: string;
  deadline: Date;
  minLqtMinted: BigNumber;
  amount: number;
  isCtezSide: boolean;
}

export interface CollectFromLiquidityParams {
  to: string;
  isCtezSide: boolean;
}

export interface RemoveLiquidityParams {
  to: string;
  deadline: Date;
  lqtBurned: BigNumber;
  minSelfReceived : BigNumber;
  minProceedsReceived: BigNumber;
  minSubsidyReceived: BigNumber;
  isCtezSide: boolean;
}

export interface TezToCtezParams {
  to: string;
  tezSold: number;
  minCtezBought: number;
  deadline: Date;
  // cashSold: number; # For !CASH_IS_TEZ
}

export interface ctezToTezParams {
  to: string;
  ctezSold: number;
  minTezBought: number;
  deadline: Date;
}

export interface TokenToTokenParams {
  outputCfmmContract: string;
  minTokensBought: number;
  to: string;
  tokensSold: number;
  deadline: Date;
}

export interface CfmmStorage {
  tokenPool: BigNumber;
  cashPool: BigNumber;
  pendingPoolUpdates: BigNumber;
  tokenAddress: string;
  lqtAddress: string;
  lastOracleUpdate: Date;
  consumerEntrypoint: string;
  lqtTotal: BigNumber;
}

export interface HalfDexLQTData {
  lqt: BigNumber;
  lqtShare: BigNumber;
}

export interface UserLQTData {
  ctezDexLqt: BigNumber;
  ctezDexLqtShare: BigNumber;
  tezDexLqt: BigNumber;
  tezDexLqtShare: BigNumber;
}
