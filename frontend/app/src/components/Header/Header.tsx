import React, { useState } from 'react';
import styled from '@emotion/styled';
import { IconButton, Grid, Box } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import TezosIcon from '../TezosIcon';
import { Typography } from '../Typography';
import { SignIn } from '../SignIn/SignIn';
import { NavigationDrawer } from '../NavigationDrawer/NavigationDrawer';

export interface HeaderProps {
  title: string;
  onClick?: () => void | Promise<void>;
}

const HeaderActionBox = styled(Box)`
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &h1 {
    font-weight: 900;
    font-size: 20px;
    line-height: 1.5;
    margin: 6px 0 6px 10px;
    display: inline-block;
    vertical-align: top;
  }
`;

const HeaderContainer = styled.div`
  .wrapper {
    font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 15px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  svg {
    display: inline-block;
    vertical-align: top;
  }

  h1 {
    font-weight: 900;
    font-size: 20px;
    line-height: 1;
    margin: 6px 0 6px 10px;
    display: inline-block;
    vertical-align: top;
  }
`;

export const Header: React.FC<HeaderProps> = ({ title, onClick }) => {
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
              <div onClick={onClick} aria-hidden="true" style={{ display: 'flex', flexGrow: 1 }}>
                <TezosIcon />
                <Typography size="body" component="h1" margin="0.4em 0 0.4em 1em">
                  {title}
                </Typography>
              </div>
            </Grid>
            <Grid item className="sign-in">
              <SignIn />
            </Grid>
          </Grid>
        </HeaderActionBox>
      </header>
      <NavigationDrawer open={navDrawer} handleDrawerClose={handleNavDrawerClose} />
    </HeaderContainer>
  );
};
