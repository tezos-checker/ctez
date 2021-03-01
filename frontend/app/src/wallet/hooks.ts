import { useContext } from 'react';
import { disconnectBeacon } from '.';
import { WalletInterface } from '../interfaces';
import WalletContext from './walletContext';

type useWalletReturnType = [
  Partial<WalletInterface>,
  (wallet: Partial<WalletInterface>) => void,
  () => void,
];
export const useWallet = (): useWalletReturnType => {
  const { wallet, setWallet } = useContext(WalletContext);
  const disconnectWallet = () => {
    wallet.wallet && disconnectBeacon(wallet.wallet);
    setWallet({});
  };
  return [wallet, setWallet, disconnectWallet];
};
