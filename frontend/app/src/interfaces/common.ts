export interface ErrorType {
  [key: number]: string;
}

export type AddressTrimSizeType = 'small' | 'medium' | 'large';

export interface BaseStats {
  currentTarget: number;
  currentPrice: number;
  premium: number;
  currentAnnualDrift: number;
  totalLiquidity: number;
}
