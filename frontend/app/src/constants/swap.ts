import { ValueOf } from './helper';

export interface ConversionFormParams {
  to: string;
  slippage: number;
  deadline: number;
  amount: number | undefined;
}

export const BUTTON_TXT = {
  CONNECT: 'Connect Wallet',
  ENTER_AMT: 'Enter an amount',
  SWAP: 'Swap',
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw',
  BURN: 'Burn',
  MINT: 'Mint',
  CREATE_OVEN: 'Create Oven',
} as const;

export type TButtonText = ValueOf<typeof BUTTON_TXT>;

export const TOKEN = {
  CTez: 'ctez',
  Tez: 'tez',
} as const;

export type TToken = ValueOf<typeof TOKEN>;

export const FORM_TYPE = {
  CTEZ_TEZ: 'cTezToTez',
  TEZ_CTEZ: 'tezToCTez',
} as const;

export type TFormType = ValueOf<typeof FORM_TYPE>;
