import { AddressTrimSizeType } from '../interfaces/common';

export const trimSizeMap = {
  small: 4,
  medium: 7,
  large: 10,
};

export const trimAddress = (address: string, trimSize: AddressTrimSizeType = 'small'): string => {
  return `${address.substr(0, trimSizeMap[trimSize])}...${address.substr(
    trimSizeMap[trimSize] * -1,
  )}`;
};
