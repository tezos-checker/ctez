import BigNumber from 'bignumber.js';

type TFormatNumber = (value: string | number, shiftedBy?: number) => number;

export const formatNumber: TFormatNumber = (value, shiftedBy = -6) => {
  return new BigNumber(value).shiftedBy(shiftedBy).toNumber() ?? 0;
};
