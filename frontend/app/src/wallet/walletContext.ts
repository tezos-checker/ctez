import { createContext } from 'react';
import { IWalletContext } from '../interfaces/wallet';

const WalletContext = createContext<IWalletContext>({
  wallet: {},
  setWallet: () => {},
});

export const WalletProvider = WalletContext.Provider;
export default WalletContext;
