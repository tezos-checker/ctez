import React, { Suspense, useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { WalletProvider } from './wallet/walletContext';
import { WalletInterface } from './interfaces';
import { initTezos, setWalletProvider } from './contracts/client';
import { APP_NAME, NETWORK, RPC_URL, RPC_PORT, CTEZ_ADDRESS, CFMM_ADDRESS } from './utils/globals';
import { getBeaconInstance, isWalletConnected } from './wallet';
import { AppRouter } from './router';
import { initCTez } from './contracts/ctez';
import { initCfmm } from './contracts/cfmm';
import { logger } from './utils/logger';
import { getNodePort, getNodeURL } from './utils/settingUtils';
import ModalContainer from './components/modals/ModalContainer';
import theme from './theme/theme';
import ErrorBoundary from './components/ErrorBoundary';

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

  const nodeUrl = wallet.pkh ? getNodeURL(wallet.pkh) : RPC_URL;
  const nodePort = wallet.pkh ? getNodePort(wallet.pkh) : RPC_PORT;

  useEffect(() => {
    const setup = async () => {
      try {
        initTezos(nodeUrl ?? RPC_URL, nodePort ?? RPC_PORT);
        await checkWalletConnection();
        CTEZ_ADDRESS && (await initCTez(CTEZ_ADDRESS));
        CFMM_ADDRESS && (await initCfmm(CFMM_ADDRESS));
      } catch (error) {
        logger.error(error);
      }
    };
    setup();
  }, [wallet.pkh, nodeUrl, nodePort]);

  return (
    <Suspense fallback="Loading...">
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <WalletProvider value={{ wallet, setWallet }}>
            <ChakraProvider theme={theme}>
              <ErrorBoundary>
                <AppRouter />
                <ModalContainer />
              </ErrorBoundary>
            </ChakraProvider>
          </WalletProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </Suspense>
  );
};

export default App;
