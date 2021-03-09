import BigNumber from 'bignumber.js';

export interface Oven {
  ovenId: number;
  address: string;
  ctez_outstanding: BigNumber;
  tez_balance: BigNumber;
  baker: string | null;
}
