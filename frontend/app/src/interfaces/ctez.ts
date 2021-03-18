import { MichelsonMap } from '@taquito/taquito';
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

export enum EditDepositorOps {
  AllowAny = 'allow_any',
  AllowAccount = 'allow_account',
}

export enum Depositor {
  any = 'any',
  whitelist = 'whitelist',
}

/**
 * TODO: Update to actual type
 */
export type depositors = any;

export interface oven_handle {
  id: BigNumber;
  owner: string;
}

export interface oven {
  admin: string;
  handle: oven_handle;
  depositors: depositors;
}

export interface CTezStorage {
  ovens: MichelsonMap<oven_handle, oven>;
  target: BigNumber;
  drift: BigNumber;
  last_drift_update: Date;
  ctez_fa12_address: string;
  cfmm_address: string;
}

export interface CTezTzktStorage {
  drift: string;
  ovens: string;
  target: string;
  cfmm_address: string;
  ctez_fa12_address: string;
  last_drift_update: string;
}
