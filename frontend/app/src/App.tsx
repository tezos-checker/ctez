import React, { Suspense, useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { LocalizationProvider } from '@material-ui/pickers';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastProvider } from 'react-toast-notifications';
import DateFnsUtils from '@material-ui/pickers/adapter/date-fns';
import { WalletProvider } from './wallet/walletContext';
import { WalletInterface } from './interfaces';
import { initTezos, setWalletProvider } from './contracts/client';
import { APP_NAME, NETWORK, RPC_URL, RPC_PORT, CTEZ_ADDRESS, CFMM_ADDRESS } from './utils/globals';
import { getBeaconInstance, isWalletConnected } from './wallet';
import { AppRouter } from './router';
import { initCTez } from './contracts/ctez';
import { initCfmm } from './contracts/cfmm';

const queryClient = new QueryClient();

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
        CFMM_ADDRESS && (await initCfmm(CFMM_ADDRESS));
      } catch (error) {
        console.log(error);
      }
    };
    setup();
  }, []);

  return (
    <Suspense fallback="Loading...">
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={DateFnsUtils}>
            <WalletProvider value={{ wallet, setWallet }}>
              <ToastProvider placement="bottom-right">
                <AppRouter />
              </ToastProvider>
            </WalletProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </Suspense>
  );
};

export default App;
