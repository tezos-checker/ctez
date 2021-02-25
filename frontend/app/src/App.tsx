import React, { Suspense, useEffect, useState } from 'react';
import { WalletProvider } from './wallet/walletContext';
import { WalletInterface } from './interfaces';
import { initTezos, setWalletProvider } from './contracts/client';
import { APP_NAME, NETWORK, RPC_URL, RPC_PORT } from './utils/globals';
import { getBeaconInstance, isWalletConnected } from './wallet';

const App: React.FC = () => {
  const [wallet, setWallet] = useState<Partial<WalletInterface>>({});
  const checkWalletConnection = async () => {
    const prevUsedWallet = isWalletConnected();
    if (prevUsedWallet) {
      const walletData = await getBeaconInstance(APP_NAME, true, NETWORK);
      walletData?.wallet && setWalletProvider(walletData.wallet);
      walletData && setWallet(walletData);
    }
  };

  useEffect(() => {
    initTezos(RPC_URL, RPC_PORT);
    checkWalletConnection();
  }, []);

  return (
    <Suspense fallback="Loading...">
      <WalletProvider value={{ wallet, setWallet }}>
        <div>App works</div>
      </WalletProvider>
    </Suspense>
  );
};

export default App;
