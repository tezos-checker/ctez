import { BigNumber } from 'bignumber.js';
import { Oven, OvenSerializable } from '../interfaces';

export const getLastOvenId = (userAddress: string): number => {
  return Number(localStorage.getItem(`oven:${userAddress}:last`) ?? 0);
};

export const saveLastOven = (userAddress: string, ovenId: number): void => {
  return localStorage.setItem(`oven:${userAddress}:last`, String(ovenId));
};

export const toSerializeableOven = (oven: Oven): OvenSerializable => {
  return {
    ...oven,
    tez_balance: oven.tez_balance.toString(),
    ctez_outstanding: oven.ctez_outstanding.toString(),
  };
};

export const toOven = (oven: OvenSerializable): Oven => {
  return {
    ...oven,
    tez_balance: new BigNumber(oven.tez_balance),
    ctez_outstanding: new BigNumber(oven.ctez_outstanding),
  };
};
