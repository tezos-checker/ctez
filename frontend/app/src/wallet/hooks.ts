import { useContext } from 'react';
import { disconnectBeacon } from '.';
import { WalletInterface } from '../interfaces';
import WalletContext from './walletContext';

type WalletReturnType = [
  Partial<WalletInterface>,
  (wallet: Partial<WalletInterface>) => void,
  () => void,
];
export const useWallet = (): WalletReturnType => {
  const { wallet, setWallet } = useContext(WalletContext);
  const disconnectWallet = () => {
    wallet.wallet && disconnectBeacon(wallet.wallet);
    setWallet({});
  };
  return [wallet, setWallet, disconnectWallet];
};
