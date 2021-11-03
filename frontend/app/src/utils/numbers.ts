import BigNumber from 'bignumber.js';

type TFormatNumber = (value: string | number, shiftedBy?: number) => number;

export const formatNumber: TFormatNumber = (value, shiftedBy = -6) => {
  return new BigNumber(value).shiftedBy(shiftedBy).toNumber() ?? 0;
};

export const formatNumberStandard = (value: number | string | null | undefined) => {
  if (value == null || Number.isNaN(Number(value))) {
    return 0;
  }
  return Number(
    Number(value).toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false }),
  );
};

export const inputFormatNumberStandard = (value: number | string | null | undefined) => {
  if (value == null || Number.isNaN(Number(value))) {
    return 0;
  }
  if (typeof value === 'string') {
    value = value.replace(/^0+/, '');
  }

  return value.toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false });
};
