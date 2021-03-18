import { BigNumber } from 'bignumber.js';
import { Oven, OvenSerializable } from '../interfaces';
import { TOTAL_OVEN_IMAGES } from './globals';

export const getLastOvenId = (userAddress: string, cTezAddress: string): number => {
  return Number(localStorage.getItem(`oven:${userAddress}:${cTezAddress}:last`) ?? 0);
};

export const saveLastOven = (userAddress: string, cTezAddress: string, ovenId: number): void => {
  return localStorage.setItem(`oven:${userAddress}:${cTezAddress}:last`, String(ovenId));
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

export const maxCTez = (tez: number, target: number): number => {
  return Number((tez / (target * (16 / 15))).toFixed(6));
};

/**
 * For scaling image ids
 *
 * */
export const scaleBetween = (
  unscaledNum: number,
  minAllowed: number,
  maxAllowed: number,
  min: number,
  max: number,
): number => {
  const adjustedMax = min === max ? max + 1 : max;
  const num = Math.ceil(
    ((maxAllowed - minAllowed) * (unscaledNum - min)) / (adjustedMax - min) + minAllowed,
  );
  if (num % 1 === 0) return num;
  return scaleBetween(num, minAllowed, maxAllowed, min, adjustedMax);
};

export const getOvenImageId = (ovenId: number, totalOvens: number): number => {
  return ovenId > TOTAL_OVEN_IMAGES ? scaleBetween(ovenId, 1, 5, 6, totalOvens) : ovenId;
};

export const getOvenMaxCtez = (ovenTez: string, currentCtez: string, target: string) => {
  const max = maxCTez(new BigNumber(ovenTez).shiftedBy(-6).toNumber(), Number(target));
  const remaining = max - new BigNumber(currentCtez).shiftedBy(-6).toNumber();
  return { max, remaining: Number(remaining.toFixed(6)) };
};
