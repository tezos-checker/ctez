export interface ErrorType {
  [key: number]: string;
}

export type AddressTrimSizeType = 'small' | 'medium' | 'large';

export interface BaseStats {
  originalTarget: number;
  currentTarget: string;
  currentPrice: string;
  premium: string;
  currentAnnualDrift: string;
  annualDriftPastWeek: string;
  totalLiquidity: string;
  drift: number;
  [key: string]: string | number;
}

export interface UserOvenStats {
  totalOvens: number;
  xtz: number;
  ctez: number;
}
