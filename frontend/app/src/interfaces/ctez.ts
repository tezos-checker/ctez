import BigNumber from 'bignumber.js';

export interface Oven {
  address: string;
  ctez_outstanding: BigNumber;
  tez_balance: BigNumber;
}
