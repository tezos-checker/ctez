import { ValueOf } from './helper';

export interface IAddLiquidityForm {
  amount: number;
  slippage: number;
  deadline: number;
}

export const ADD_BTN_TXT = {
  CONNECT: 'Connect Wallet',
  ENTER_AMT: 'Enter an amount',
  ADD_LIQ: 'Add Liquidity',
} as const;

export type TAddBtnTxt = ValueOf<typeof ADD_BTN_TXT>;
