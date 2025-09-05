import { WalletContract } from '@taquito/taquito/dist/types/contract';
import BigNumber from 'bignumber.js';
import { CTEZ_FA12_ADDRESS } from '../utils/globals';
import { initContract } from './utils';

let CTezFa12: WalletContract | null = null;

export const getCTezFa12Contract = async (address = CTEZ_FA12_ADDRESS): Promise<WalletContract> => {
  if (!CTezFa12) {
    CTezFa12 = await initContract(address);
  }
  return CTezFa12;
};

export const getCtezFa12TotalSupply = async (address = CTEZ_FA12_ADDRESS): Promise<BigNumber> => {
  const contract = await getCTezFa12Contract(address);
  const totalSupply = new BigNumber((await contract.contractViews.viewTotalSupply().executeView({viewCaller: contract.address})) ?? 0);
  return totalSupply;
};
