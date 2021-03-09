import BigNumber from 'bignumber.js';

export interface Oven {
  ovenId: number;
  address: string;
  ctez_outstanding: BigNumber;
  tez_balance: BigNumber;
  baker: string | null;
}

export interface OvenSerializable {
  ovenId: number;
  address: string;
  ctez_outstanding: string;
  tez_balance: string;
  baker: string | null;
}
