import { WalletContract } from '@taquito/taquito/dist/types/contract';
import { CTEZ_FA12_ADDRESS, LQT_FA12_ADDRESS } from '../utils/globals';
import { initContract } from './utils';

let LQTFa12: WalletContract | null = null;
let CTezFa12: WalletContract | null = null;

export const getLQTContract = async (address = LQT_FA12_ADDRESS): Promise<WalletContract> => {
  if (!LQTFa12) {
    LQTFa12 = await initContract(address);
  }
  return LQTFa12;
};

export const getCTezFa12Contract = async (address = CTEZ_FA12_ADDRESS): Promise<WalletContract> => {
  if (!CTezFa12) {
    CTezFa12 = await initContract(address);
  }
  return CTezFa12;
};
