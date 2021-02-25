import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import { RPC_URL, RPC_PORT } from '../utils/globals';

let tezos: TezosToolkit | null = null;

export const setWalletProvider = (wallet: BeaconWallet): void => {
  tezos && tezos.setProvider({ wallet });
};

export const initTezos = (url = RPC_URL, port: string | number = RPC_PORT): void => {
  tezos = new TezosToolkit(`${url}:${port}`);
};

export const getTezosInstance = (): TezosToolkit => {
  if (tezos === null) {
    throw new Error('Tezos not initialized. call initTezos to initialize tezos client');
  }
  return tezos;
};
