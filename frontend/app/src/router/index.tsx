import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { routes } from './routes';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Header } from '../components/header/Header';
import { getBeaconInstance } from '../wallet';
import { APP_NAME, NETWORK } from '../utils/globals';
import { setWalletProvider } from '../contracts/client';
import { OvenSlice } from '../redux/slices/OvenSlice';
import { useWallet } from '../wallet/hooks';

export const AppRouter: React.FC = () => {
  const dispatch = useDispatch();
  const [{ pkh: userAddress }, setWallet, disconnectWallet] = useWallet();
  const [toggled, setToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  function handleToggled(value: boolean) {
    setToggled(value);
    value && setCollapsed(false);
  }

  const connectWallet = async () => {
    const newWallet = await getBeaconInstance(APP_NAME, true, NETWORK);
    newWallet?.wallet && setWalletProvider(newWallet.wallet);
    newWallet && setWallet(newWallet);
  };

  const onDisconnectWallet = () => {
    dispatch(OvenSlice.actions.setUserOvenData({ ctez: 0, xtz: 0, totalOvens: 0 }));
    disconnectWallet();
  };

  return (
    <Router>
      <Flex>
        <Sidebar
          handleCollapsed={handleCollapsed}
          handleToggled={handleToggled}
          collapsed={collapsed}
          toggled={toggled}
        />
        <Flex direction="column" w="100%" backgroundColor="gray.100">
          <Header
            walletAddress={userAddress}
            onConnectWallet={connectWallet}
            onDisconnectWallet={onDisconnectWallet}
            handleToggled={handleToggled}
            toggled={toggled}
          />
          <Switch>
            {routes.map((route) => (
              <Route
                key={typeof route.path === 'string' ? route.path : route.path[0]}
                path={route.path}
              >
                {route.Component}
              </Route>
            ))}
          </Switch>
        </Flex>
      </Flex>
    </Router>
  );
};
