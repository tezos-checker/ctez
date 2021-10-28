import { ValueOf } from './helper';

export interface IAddLiquidityForm {
  amount: number | undefined;
  ctezAmount: number | undefined;
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
  lqtBurned: number;
  slippage: number;
}

export const REMOVE_BTN_TXT = {
  CONNECT: 'Connect Wallet',
  ENTER_AMT: 'Enter an amount',
  REMOVE_LIQ: 'Remove Liquidity',
} as const;

export type TRemoveBtnTxt = ValueOf<typeof REMOVE_BTN_TXT>;
