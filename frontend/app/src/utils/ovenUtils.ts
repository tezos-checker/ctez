import { BigNumber } from 'bignumber.js';
import { Oven, OvenSerializable } from '../interfaces';
import { TOTAL_OVEN_IMAGES } from './globals';

export const getLastOvenId = (userAddress: string, cTezAddress: string): number => {
  return Number(localStorage.getItem(`oven:${userAddress}:${cTezAddress}:last`) ?? 0);
};

export const saveLastOven = (userAddress: string, cTezAddress: string, ovenId: number): void => {
  return localStorage.setItem(`oven:${userAddress}:${cTezAddress}:last`, String(ovenId));
};

export const getExternalOvens = (userAddress: string, cTezAddress: string): string[] => {
  let result: string[] = [];
  const data = localStorage.getItem(`extOven:${userAddress}:${cTezAddress}`);
  if (data) {
    result = data.split(',');
  }
  return result;
};

export const addExternalOven = (
  userAddress: string,
  cTezAddress: string,
  ovenAddress: string,
): void => {
  const prevOvens = getExternalOvens(userAddress, cTezAddress);
  prevOvens.unshift(ovenAddress);
  localStorage.setItem(`extOven:${userAddress}:${cTezAddress}`, prevOvens.join(','));
};

export const removeExternalOven = (
  userAddress: string,
  cTezAddress: string,
  ovenAddress: string,
): string[] => {
  const prevOvens = getExternalOvens(userAddress, cTezAddress);
  const newList = prevOvens.filter((o) => o !== ovenAddress);
  localStorage.setItem(`extOven:${userAddress}:${cTezAddress}`, newList.join(','));
  return newList;
};

export const toSerializeableOven = (oven: Oven): OvenSerializable => {
  return {
    ...oven,
    ovenId: Number(oven.ovenId),
    tez_balance: oven.tez_balance.toString(),
    ctez_outstanding: oven.ctez_outstanding.toString(),
  };
};

export const toOven = (oven: OvenSerializable): Oven => {
  return {
    ...oven,
    tez_balance: oven.tez_balance,
    ctez_outstanding: oven.ctez_outstanding,
    ovenId: oven.ovenId,
  };
};

export const maxCTez = (tez: number, target: number): number => {
  const result = (tez * 1e6 * 15) / ((target * 16));
  return Number((Math.floor(result) / 1e6).toFixed(6));
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

export const getOvenMaxCtez = (
  ovenTez: string | number,
  currentCtez: string | number,
  target: number,
) => {
  const max = maxCTez(new BigNumber(ovenTez).shiftedBy(-6).toNumber(), target / 2 ** 64);
  const remaining = max - new BigNumber(currentCtez).shiftedBy(-6).toNumber();
  return { max, remaining: Number(remaining.toFixed(6)) };
};

export const getOvenCtezOutstandingAndFeeIndex = (
  currentOvenOutstandingCtez: string | number,
  currentOvenFeeIndex: string | number,
  sellCtezDexFeeIndex: string | number,
  sellTezDexFeeIndex: string | number,
): { ctezOutstanding: number, feeIndex: number } => {
  const dexFeeIndex = new BigNumber(sellCtezDexFeeIndex).multipliedBy(sellTezDexFeeIndex);
  const prevCtezOutstanding = new BigNumber(currentOvenOutstandingCtez);
  const prevFeeIndex = new BigNumber(currentOvenFeeIndex);
  const ctezOutstanding = prevCtezOutstanding.multipliedBy(dexFeeIndex).dividedToIntegerBy(prevFeeIndex);

  const feeIndex = prevCtezOutstanding.isGreaterThan(0)
    ? ctezOutstanding.multipliedBy(prevFeeIndex).dividedBy(prevCtezOutstanding)
    : dexFeeIndex;

  return { ctezOutstanding: ctezOutstanding.toNumber(), feeIndex: Math.ceil(feeIndex.toNumber()) }
}

export const getFeeRate = (q: number, Q: number): number => {
  const maxRate = 5845483520;
  if (8 * q < Q)
    return maxRate;
  if (8 * q > 7 * Q)
    return 0;
  return Math.abs(maxRate * (7 * Q - 8 * q)) / (6 * Q);
}

export const getUpdatedDexFeeIndex = (
  delta: number,
  Q: number,
  dexFeeIndex: number,
  dexSelfReserves: number
): number => {
  const rate = getFeeRate(dexSelfReserves, Q);
  return dexFeeIndex + delta * dexFeeIndex * rate / 2 ** 64;
}
