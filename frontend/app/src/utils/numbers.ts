import BigNumber from 'bignumber.js';

export const formatNumber = (value: string | number, shiftedBy = -6) => {
  return new BigNumber(value).shiftedBy(shiftedBy).toNumber() ?? 0;
};
