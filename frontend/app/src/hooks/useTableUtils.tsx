import { Text as Typography } from '@chakra-ui/react';

export const useTableNumberUtils = () => {
  
  const positiveOrNegative = (value: number) => {
    if (Number(value) > 0) {
      return <Typography color="success.main">+{value.toFixed(2)}%</Typography>;
    }  if (Number(value) < 0) {
      return <Typography color="error.main">{value.toFixed(2)}%</Typography>;
    }
      return value;
    
  };

  const valueFormat = (value: number, opt: { percentChange?: boolean} = {}) => {
    if (value >= 100) {
      return `${opt.percentChange ? '' : '$'}${Math.round(value).toLocaleString('en-US')}`;
    }

    if (!opt.percentChange && value < 0.01) {
      return '< $0.01';
    }
    if (opt.percentChange && value < 0.01) {
      return '< 0.01';
    }
    return `${opt.percentChange ? '' : '$'}${value?.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  };

  // const stringSort = useMemo(
  //   () => (rowA, rowB, columnId) => {
  //     const a = String(rowA.values[columnId]).toLowerCase();
  //     const b = String(rowB.values[columnId]).toLowerCase();
  //     return a.localeCompare(b);
  //   },
  //   [],
  // );
  //
  // const numberSort = useMemo(
  //   () => (rowA, rowB, columnId) => {
  //     const a = parseFloat(rowA.values[columnId]);
  //     const b = parseFloat(rowB.values[columnId]);
  //     return a > b ? 1 : -1;
  //   },
  //   [],
  // );

  return { positiveOrNegative, valueFormat };
};
