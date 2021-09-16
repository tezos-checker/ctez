import { MichelsonMap } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

export interface Oven {
  ovenId: BigNumber;
  address: string;
  ctez_outstanding: BigNumber;
  tez_balance: BigNumber;
  baker: string | null;
  isExternal?: boolean;
  isImported?: boolean;
}

export interface OvenSerializable {
  ovenId: number;
  address: string;
  ctez_outstanding: string;
  tez_balance: string;
  baker: string | null;
  isExternal?: boolean;
  isImported?: boolean;
}

export enum EditDepositorOps {
  AllowAny = 'allow_any',
  AllowAccount = 'allow_account',
}

export enum Depositor {
  any = 'any',
  whitelist = 'whitelist',
}

export type depositors = string[] | { any: symbol };

export type DepositorStatus = 'denyEveryone' | 'allowEveryone' | 'whitelist';

export interface oven_handle {
  id: BigNumber;
  owner: string;
}

export interface OvenStorage {
  admin: string;
  handle: oven_handle;
  depositors: depositors;
}

export interface CTezStorage {
  ovens: MichelsonMap<oven_handle, OvenStorage>;
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
