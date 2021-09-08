import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import { routes } from './routes';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Header } from '../components/header/Header';

export const AppRouter: React.FC = () => {
  const [toggled, setToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  function handleToggled(value: boolean) {
    setToggled(value);
    value && setCollapsed(false);
  }

  const connectWallet = () => {
    // eslint-disable-next-line no-console
    console.log('connect wallet');
  };

  const disconnectWallet = () => {
    // eslint-disable-next-line no-console
    console.log('disconnect wallet');
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
        <Flex direction="column">
          <Header
            walletAddress={null}
            onConnectWallet={connectWallet}
            onDisconnectWallet={disconnectWallet}
            handleToggled={handleToggled}
            toggled={toggled}
          />
          <Switch>
            {routes.map((route) => (
              <Route key={route.path} path={route.path}>
                {route.Component}
              </Route>
            ))}
          </Switch>
        </Flex>
      </Flex>
    </Router>
  );
};
