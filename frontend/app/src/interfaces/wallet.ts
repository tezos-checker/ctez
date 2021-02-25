import { BeaconWallet } from '@taquito/beacon-wallet';

export type NetworkType = 'mainnet' | 'delphinet' | 'carthagenet' | 'sandbox';

export interface WalletInterface {
  pkh?: string;
  wallet: BeaconWallet;
  network?: string;
}

export interface IWalletContext {
  wallet: Partial<WalletInterface>;
  setWallet: (wallet: Partial<WalletInterface>) => void;
}
