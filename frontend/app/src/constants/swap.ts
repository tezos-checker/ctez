type ValueOf<T> = T[keyof T];

export const BUTTON_TXT = {
  CONNECT: 'Connect Wallet',
  ENTER_AMT: 'Enter an amount',
  SWAP: 'Swap',
} as const;

export type TButtonText = ValueOf<typeof BUTTON_TXT>;
