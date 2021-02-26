import React from 'react';
import styled from '@emotion/styled';
import TezosIcon from '../TezosIcon';
import { Typography } from '../Typography';
import { SignIn } from '../SignIn/SignIn';

export interface HeaderProps {
  title: string;
  onClick?: () => void | Promise<void>;
}

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
  return (
    <HeaderContainer>
      <header>
        <div className="wrapper">
          <div onClick={onClick} aria-hidden="true">
            <TezosIcon />
            <Typography size="body" component="h1" margin="0.4em 0 0.4em 1em">
              {title}
            </Typography>
          </div>
          <SignIn />
        </div>
      </header>
    </HeaderContainer>
  );
};
