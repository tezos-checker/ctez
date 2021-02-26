import { WalletContract } from '@taquito/taquito';
import { initContract } from './utils';

let cTez: WalletContract;

export const getContract = async (address: string): Promise<WalletContract> => {
  if (!cTez) {
    cTez = await initContract(address);
  }
  return cTez;
};
