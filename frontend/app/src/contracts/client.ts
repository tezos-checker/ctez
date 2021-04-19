import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit, MichelCodecPacker } from '@taquito/taquito';

let tezos: TezosToolkit;

export const setWalletProvider = (wallet: BeaconWallet): void => {
  tezos && tezos.setProvider({ wallet });
};

export const initTezos = (url: string, port: string | number): void => {
  tezos = new TezosToolkit(`${url}:${port}`);
  tezos.setPackerProvider(new MichelCodecPacker());
};

export const getTezosInstance = (): TezosToolkit => {
  return tezos;
};
