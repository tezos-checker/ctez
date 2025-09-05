export interface ErrorType {
  [key: number]: string;
}

export type AddressTrimSizeType = 'small' | 'medium' | 'large';

export interface BaseStats {
  originalTarget: number;
  ctezDexFeeIndex: number;
  tezDexFeeIndex: number;
  currentTarget: number;
  currentCtezSellPrice: number;
  currentTezSellPrice: number;
  currentCtezBuyPrice: number;
  currentTezBuyPrice: number;
  currentAvgPrice: number;
  premium: number;
  currentAnnualDrift: number;
  drift: number;
  ctezTotalSupply: number;
  ctezDexSelfTokens: number;
  ctezDexTargetLiquidity: number;
  ctezDexProceeds: number;
  ctezDexSubsidy: number;
  ctezDexAnnualFeeRate: number;
  ctezLiquidityIncentives: number;
  tezDexSelfTokens: number;
  tezDexTargetLiquidity: number;
  tezDexProceeds: number;
  tezDexSubsidy: number;
  tezDexAnnualFeeRate: number;
  tezLiquidityIncentives: number;
}

export interface UserOvenStats {
  totalOvens: number;
  xtz: number;
  ctez: number;
}
