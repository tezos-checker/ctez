import { WalletContract } from '@taquito/taquito';
import BigNumber from 'bignumber.js';
import { ErrorType } from '../interfaces';
import { Oven } from '../interfaces/ctez';
import { CTEZ_ADDRESS } from '../utils/globals';
import { getLastOvenId, saveLastOven } from '../utils/ovenUtils';
import { getTezosInstance } from './client';
import { executeMethod, initContract } from './utils';

let cTez: WalletContract;

export const initCTez = async (address: string) => {
  cTez = await initContract(address);
};

export const getCTez = (): WalletContract => {
  return cTez;
};

export const create = async (userAddress: string, bakerAddress: string): Promise<string> => {
  const newOvenId = getLastOvenId(userAddress) + 1;
  const hash = await executeMethod(cTez, 'create', [newOvenId, bakerAddress]);
  saveLastOven(userAddress, newOvenId);
  return hash;
};

export const delegate = async (bakerAddress: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'delegate', [bakerAddress]);
  return hash;
};

export const deposit = async (ovenAddress: string, amount: number): Promise<string> => {
  const ovenContract = await initContract(ovenAddress);
  const hash = await executeMethod(ovenContract, 'oven_deposit', undefined, 0, amount);
  return hash;
};

export const withdraw = async (ovenId: number, amount: number, to: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'withdraw', [
    ovenId,
    new BigNumber(amount).shiftedBy(6),
    to,
  ]);
  return hash;
};

export const liquidate = async (
  ovenId: number,
  overOwner: string,
  amount: number,
  to: string,
): Promise<string> => {
  const hash = await executeMethod(cTez, 'liquidate', [
    {
      id: ovenId,
      owner: overOwner,
    },
    new BigNumber(amount).shiftedBy(6),
    to,
  ]);
  return hash;
};

export const mintOrBurn = async (quantity: number): Promise<string> => {
  const hash = await executeMethod(cTez, 'mint_or_burn', [new BigNumber(quantity).shiftedBy(6)]);
  return hash;
};

export const getOvenDelegate = async (oven: Oven): Promise<string | null> => {
  const tezos = getTezosInstance();
  const baker = await tezos.rpc.getDelegate(oven.address);
  return baker;
};

export const prepareOvenCall = async (
  storage: any,
  ovenId: number,
  userAddress: string,
): Promise<Oven> => {
  const oven = await storage.ovens.get({
    id: ovenId,
    owner: userAddress,
  });
  const baker = oven ? await getOvenDelegate(oven) : null;
  return { ...oven, baker, ovenId };
};

export const getOvens = async (userAddress: string): Promise<Oven[] | undefined> => {
  try {
    if (!cTez && CTEZ_ADDRESS) {
      await initCTez(CTEZ_ADDRESS);
    }
    const lastOvenId = getLastOvenId(userAddress);
    const storage: any = await cTez.storage();
    const ovens: Promise<Oven>[] = [];
    for (let i = lastOvenId; i > 0; i -= 1) {
      ovens.push(prepareOvenCall(storage, i, userAddress));
    }
    const allOvenData = await Promise.all(ovens);
    return allOvenData;
  } catch (error) {
    console.log(error);
  }
};

export const cTezError: ErrorType = {
  0: 'OVEN ALREADY EXISTS',
  1: 'OVEN CAN ONLY BE CALLED FROM MAIN CONTRACT',
  2: 'CTEZ FA12 ADDRESS ALREADY SET',
  3: 'CFMM ADDRESS ALREADY SET',
  4: 'OVEN DOESNT EXIST',
  5: 'OVEN MISSING WITHDRAW ENTRYPOINT',
  6: 'OVEN MISSING DEPOSIT ENTRYPOINT',
  7: 'OVEN MISSING DELEGATE ENTRYPOINT',
  8: 'EXCESSIVE TEZ WITHDRAWAL',
  9: 'CTEZ FA12 CONTRACT MISSING MINT OR BURN ENTRYPOINT',
  10: 'CANNOT BURN MORE THAN OUTSTANDING AMOUNT OF CTEZ',
  11: 'OVEN NOT UNDERCOLLATERALIZED',
  12: 'EXCESSIVE CTEZ MINTING',
  13: 'CALLER MUST BE CFMM',
};
