import { ValueOf } from './helper';

export interface IAddLiquidityForm {
  amount: number | undefined | '';
  slippage: number;
  deadline: number;
}

export const ADD_BTN_TXT = {
  CONNECT: 'Connect Wallet',
  ENTER_AMT: 'Enter an amount',
  ADD_LIQ: 'Add Liquidity',
} as const;

export type TAddBtnTxt = ValueOf<typeof ADD_BTN_TXT>;

export interface IRemoveLiquidityForm {
  deadline: number | undefined;
  lqtBurned: string | '';
  slippage: number;
}

export const REMOVE_BTN_TXT = {
  CONNECT: 'Connect Wallet',
  ENTER_AMT: 'Enter an amount',
  REMOVE_LIQ: 'Remove Liquidity',
} as const;

export const COLLECT_BTN_TXT = {
  CONNECT: 'Connect Wallet',
  ENTER_AMT: 'Enter an amount',
  REDEEM: 'Redeem',
  NO_SHARE: 'You have no share in the dex',
  NO_WITHDRAWS: 'There is nothing to withdraw',
} as const;

export type TRemoveBtnTxt = ValueOf<typeof REMOVE_BTN_TXT>;
