import { WalletContract } from '@taquito/taquito';
import { ErrorType } from '../interfaces';
import { Oven } from '../interfaces/ctez';
import { CTEZ_ADDRESS } from '../utils/globals';
import { executeMethod, initContract } from './utils';

let cTez: WalletContract;

export const initCTez = async (address: string) => {
  cTez = await initContract(address);
};

export const getCTez = (): WalletContract => {
  return cTez;
};

export const create = async (bakerAddress: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'create', [bakerAddress]);
  return hash;
};

export const delegate = async (bakerAddress: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'delegate', [bakerAddress]);
  return hash;
};

export const deposit = async (amount: number): Promise<string> => {
  const hash = await executeMethod(cTez, 'deposit', undefined, 0, amount);
  return hash;
};

export const withdraw = async (amount: number, to: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'withdraw', [amount, to]);
  return hash;
};

export const liquidate = async (overOwner: string, amount: number, to: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'liquidate', [overOwner, amount, to]);
  return hash;
};

export const mintOrBurn = async (quantity: number): Promise<string> => {
  const hash = await executeMethod(cTez, 'mint_or_burn', [quantity]);
  return hash;
};

export const getOven = async (userAddress: string): Promise<Oven | undefined> => {
  try {
    if (!cTez && CTEZ_ADDRESS) {
      await initCTez(CTEZ_ADDRESS);
    }
    const storage: any = await cTez.storage();
    const oven = await storage.ovens.get(userAddress);
    return oven;
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
