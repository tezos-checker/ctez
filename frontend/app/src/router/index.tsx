import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import React, { useState, Suspense } from 'react';
import { routes } from './routes';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Header } from '../components/header/Header';

export const AppRouter: React.FC = () => {
  const backgroundColor = useColorModeValue('gray.100', '#0A194E');
  const [toggled, setToggled] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  function handleToggled(value: boolean) {
    setToggled(value);
    value && setCollapsed(false);
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

            <Box overflow="hidden">
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
