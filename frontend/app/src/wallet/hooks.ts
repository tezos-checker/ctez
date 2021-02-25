import { useContext } from 'react';
import { IWalletContext } from '../interfaces';
import WalletContext from './walletContext';

export const useWallet = (): IWalletContext => {
  const walletContext = useContext(WalletContext);
  return walletContext;
};
