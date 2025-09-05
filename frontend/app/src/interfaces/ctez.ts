import { MichelsonMap } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

export interface Oven {
  ovenId: string | number;
  address: string;
  ctez_outstanding: string | number;
  tez_balance: string | number;
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

export type depositors = any;

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

export interface CTezContext {
  ctez_fa12_address: string;
  drift: BigNumber;
  target: BigNumber;
  _Q: BigNumber;
}

export interface LiquidityOwner {
  liquidity_shares : BigNumber;
  proceeds_owed : BigNumber;
  subsidy_owed : BigNumber;
}

export interface HalfDex {
  fee_index: BigNumber;
  liquidity_owners: MichelsonMap<string, LiquidityOwner>;
  total_liquidity_shares: BigNumber
  self_reserves: BigNumber;
  proceeds_debts: BigNumber;
  proceeds_reserves: BigNumber
  subsidy_debts: BigNumber;
  subsidy_reserves: BigNumber;
}

export interface CTezStorage {
  ovens: MichelsonMap<oven_handle, OvenStorage>;
  context: CTezContext;
  last_update: Date;
  sell_ctez: HalfDex;
  sell_tez: HalfDex;
}

export interface CTezTzktStorage {
  drift: string;
  ovens: string;
  target: string;
  cfmm_address: string;
  ctez_fa12_address: string;
  last_drift_update: string;
}

export interface AllOvenDatum {
  id: string;
  active: boolean;
  hash: string;
  key: {
    id: string;
    owner: string;
  };
  value: {
    address: string;
    tez_balance: string;
    ctez_outstanding: string;
    fee_index: string;
  };
  firstLevel: number;
  lastLevel: number;
  updates: number;
  /**
   * Added in frontend
   */
  isImported?: boolean;
}
