export interface ErrorType {
  [key: number]: string;
}

export type AddressTrimSizeType = 'small' | 'medium' | 'large';

export interface BaseStats {
  currentTarget: string;
  currentPrice: string;
  premium: string;
  currentAnnualDrift: string;
  annualDriftPastWeek: string;
  totalLiquidity: string;
  [key: string]: string;
}

export interface UserOvenStats {
  totalOvens: number;
  xtz: number;
  ctez: number;
}
