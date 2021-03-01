import { WalletContract } from '@taquito/taquito';
import { executeMethod, initContract } from './utils';

let cTez: WalletContract;

export const initCTez = async (address: string) => {
  cTez = await initContract(address);
};

export const getCTez = async (): Promise<WalletContract> => {
  return cTez;
};

export const create = async (bakerAddress: string): Promise<string> => {
  const hash = await executeMethod(cTez, 'create', [bakerAddress]);
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
