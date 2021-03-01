import React, { Suspense, useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { WalletProvider } from './wallet/walletContext';
import { WalletInterface } from './interfaces';
import { initTezos, setWalletProvider } from './contracts/client';
import { APP_NAME, NETWORK, RPC_URL, RPC_PORT, CTEZ_ADDRESS } from './utils/globals';
import { getBeaconInstance, isWalletConnected } from './wallet';
import { AppRouter } from './router';
import { create, initCTez } from './contracts/ctez';

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
    const setup = async () => {
      try {
        initTezos(RPC_URL, RPC_PORT);
        await checkWalletConnection();
        CTEZ_ADDRESS && (await initCTez(CTEZ_ADDRESS));
      } catch (error) {
        console.log(error);
      }
    };
    setup();
  }, []);

  return (
    <Suspense fallback="Loading...">
      <HelmetProvider>
        <WalletProvider value={{ wallet, setWallet }}>
          <AppRouter />
        </WalletProvider>
      </HelmetProvider>
    </Suspense>
  );
};

export default App;
