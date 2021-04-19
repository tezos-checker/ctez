import React, { useState } from 'react';
import styled from '@emotion/styled';
import { IconButton, Grid, Box } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { SignIn } from '../SignIn/SignIn';
import { NavigationDrawer } from '../NavigationDrawer/NavigationDrawer';
import { CTezIcon } from '../CTezIcon/CTezIcon';

export interface StatItem {
  title: string;
  value: number | string;
}

export interface StatsBarProps {
  stats: StatItem[];
}

export interface HeaderProps extends StatsBarProps {
  onClick?: () => void | Promise<void>;
  loggedIn?: boolean;
}

const HeaderActionBox = styled(Box)`
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderContainer = styled.div`
  svg {
    display: inline-block;
    vertical-align: top;
  }
`;

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <Box p={2} color="#fff" sx={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        {stats.map((item, index) => {
          return (
            <Grid item key={`${item.title}-${index}`}>
              {item.title}: {item.value}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export const Header: React.FC<HeaderProps> = ({ onClick, stats, loggedIn }) => {
  const [navDrawer, setNavDrawer] = useState(false);
  const handleNavDrawerClose = () => setNavDrawer(false);
  return (
    <HeaderContainer>
      <header>
        <HeaderActionBox>
          <Grid container direction="row" style={{ flexWrap: 'nowrap' }}>
            <Grid item style={{ flex: '0 0 auto' }}>
              <IconButton onClick={() => setNavDrawer(true)}>
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              <div
                onClick={onClick}
                aria-hidden="true"
                style={{ display: 'flex', flexGrow: 1, cursor: 'pointer' }}
              >
                <CTezIcon />
              </div>
            </Grid>
            <Grid item className="sign-in">
              <SignIn />
            </Grid>
          </Grid>
        </HeaderActionBox>
        {stats.length > 0 && <StatsBar stats={stats} />}
      </header>
      <NavigationDrawer
        open={navDrawer}
        handleDrawerClose={handleNavDrawerClose}
        showSettings={loggedIn}
      />
    </HeaderContainer>
  );
};
