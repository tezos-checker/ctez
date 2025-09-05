import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import React, { useState, Suspense } from 'react';
import { routes } from './routes';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import { useThemeColors } from '../hooks/utilHooks';

export const AppRouter: React.FC = () => {
  const [backgroundColor] = useThemeColors(['routerBg']);
  const [toggled, setToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  function handleToggled(value: boolean) {
    setToggled(value);
  }

  return (
    <Router>
      <Flex height="100vh">
        <Flex width="100%">
          <Sidebar
            handleCollapsed={handleCollapsed}
            handleToggled={handleToggled}
            collapsed={collapsed}
            toggled={toggled}
          />
          <Flex direction="column" w="100%" backgroundColor={backgroundColor}>
            <Header handleToggled={handleToggled} toggled={toggled} />

            <Box overflow="auto">
              <Suspense fallback="Loading..">
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
              </Suspense>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Router>
  );
};
