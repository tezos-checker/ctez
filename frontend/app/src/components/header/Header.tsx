import { Text, Flex, Button, Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { GiHamburgerMenu } from 'react-icons/gi';
import { trimAddress } from '../../utils/addressUtils';

export interface IHeaderProps {
  walletAddress: string | undefined;
  onConnectWallet: React.MouseEventHandler;
  onDisconnectWallet: React.MouseEventHandler;
  handleToggled: ((value: boolean) => void) | undefined;
  toggled: boolean;
}

export const Header: React.FC<IHeaderProps> = ({
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  handleToggled,
  toggled,
}) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
        <Box marginStart="auto" marginEnd="10px" cursor="pointer" onClick={toggleDarkMode}>
          {darkMode ? <FiSun size={26} /> : <FiMoon size={26} />}
        </Box>
        <Button
          border="1px solid rgba(0, 0, 0, 0.07)"
          backgroundColor="transparent"
          onClick={walletAddress ? onDisconnectWallet : onConnectWallet}
        >
          <Text>{walletAddress ? trimAddress(walletAddress) : 'Connect wallet'}</Text>
        </Button>
      </Flex>
    </div>
  );
};
