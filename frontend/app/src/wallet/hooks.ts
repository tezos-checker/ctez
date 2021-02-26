import { useContext } from 'react';
import { WalletInterface } from '../interfaces';
import WalletContext from './walletContext';

export const useWallet = (): [
  Partial<WalletInterface>,
  (wallet: Partial<WalletInterface>) => void,
] => {
  const walletContext = useContext(WalletContext);
  return [walletContext.wallet, walletContext.setWallet];
};
