import { Flex, Box, useColorMode } from '@chakra-ui/react';
import React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { GiHamburgerMenu } from 'react-icons/gi';
import Button from '../button/Button';
import SignIn from '../SignIn/SignIn';

export interface IHeaderProps {
  handleToggled: ((value: boolean) => void) | undefined;
  toggled: boolean;
}

export const Header: React.FC<IHeaderProps> = ({ handleToggled, toggled }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <div>
      <Flex padding="16px" alignItems="center">
        <Button
          border="1px solid rgba(0, 0, 0, 0.07)"
          backgroundColor="transparent"
          className="md-menu"
          onClick={() => handleToggled && handleToggled(!toggled)}
        >
          <GiHamburgerMenu />
        </Button>
        <Box marginStart="auto" marginEnd="10px" cursor="pointer" onClick={toggleColorMode}>
          {colorMode === 'light' ? <FiSun size={26} /> : <FiMoon size={26} />}
        </Box>
        <SignIn />
      </Flex>
    </div>
  );
};
