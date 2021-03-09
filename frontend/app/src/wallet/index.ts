import { BeaconWallet } from '@taquito/beacon-wallet';
import { BeaconMessageType, NetworkType } from '@airgap/beacon-sdk';
import { WalletInterface } from '../interfaces/wallet';
import { NETWORK } from '../utils/globals';

export const setConnected = (): void => {
  localStorage.setItem('wallet-connected', 'true');
};

export const isWalletConnected = (): boolean => {
  return localStorage.getItem('wallet-connected') === 'true';
};

const connectBeacon = async (
  wallet: BeaconWallet,
  network: NetworkType = NetworkType.EDONET,
): Promise<boolean> => {
  try {
    await wallet.requestPermissions({ network: { type: network } });
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const disconnectBeacon = async (wallet: BeaconWallet): Promise<void> => {
  localStorage.removeItem('wallet-connected');
  await wallet.disconnect();
};

export const getBeaconInstance = async (
  name: string,
  connect = false,
  network = NETWORK,
): Promise<WalletInterface | undefined> => {
  try {
    const wallet = new BeaconWallet({ name });
    const activeAccount = await wallet.client.getActiveAccount();
    const opsRequest = activeAccount
      ? await wallet.client.checkPermissions(BeaconMessageType.OperationRequest)
      : undefined;
    const signRequest = activeAccount
      ? await wallet.client.checkPermissions(BeaconMessageType.SignPayloadRequest)
      : undefined;
    const networkType: NetworkType = network as NetworkType;
    if (connect && !opsRequest && !signRequest) {
      const isConnected = await connectBeacon(wallet, networkType);
      /**
       * May not be needed
       */
      isConnected && setConnected();
      !isConnected && (await disconnectBeacon(wallet));
    }
    return {
      wallet,
      network,
      pkh: connect ? await wallet.getPKH() : undefined,
    };
  } catch (error) {
    console.log(error);
  }
};
