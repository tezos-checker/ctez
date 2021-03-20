import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import { RPC_URL, RPC_PORT } from '../utils/globals';

let tezos: TezosToolkit;

export const setWalletProvider = (wallet: BeaconWallet): void => {
  tezos && tezos.setProvider({ wallet });
};

export const initTezos = (url: string, port: string | number): void => {
  tezos = new TezosToolkit(`${url}:${port}`);
};

export const getTezosInstance = (url = RPC_URL, port: string | number = RPC_PORT): TezosToolkit => {
  !tezos && initTezos(url, port);
  return tezos;
};
