import React, { MouseEventHandler, useMemo } from 'react';
import {
  Button as ChakraButton,
  useColorMode,
  Box,
  useColorModeValue,
  CSSObject,
} from '@chakra-ui/react';
import { ButtonProps } from '@chakra-ui/button';
import { useWallet } from '../../wallet/hooks';
import { getBeaconInstance } from '../../wallet';
import { APP_NAME, NETWORK } from '../../utils/globals';
import { setWalletProvider } from '../../contracts/client';

export interface IButtonProps extends ButtonProps {
  outerSx?: CSSObject;
  children: React.ReactNode;
  walletGuard?: boolean;
}

const Button: React.FC<IButtonProps> = (props) => {
  const [{ pkh: userAddress }, setWallet] = useWallet();
  const { colorMode } = useColorMode();
  const background = useColorModeValue('white', 'cardbgdark');

  const content = useMemo(() => {
    if (props.walletGuard && !userAddress) {
      return 'Connect Wallet';
    }

    return props.children;
  }, [props.children, props.walletGuard, userAddress]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (ev) => {
    if (props.walletGuard && !userAddress) {
      const newWallet = await getBeaconInstance(APP_NAME, true, NETWORK);
      newWallet?.wallet && setWalletProvider(newWallet.wallet);
      newWallet && setWallet(newWallet);
    } else {
      props.onClick?.(ev);
    }
  };

  if (props.variant === 'outline') {
    return (
      <Box
        type={props.type}
        className={props.className}
        bgGradient={colorMode === 'light' ? 'linear(to-r, #0F62FF, #6B5BD2)' : 'transparent'}
        _hover={{
          bgGradient: 'linear(to-r, #0F62FF, #6B5BD2)',
        }}
        border={colorMode === 'light' ? '' : '1px solid white'}
        p="1px"
        w={props.w}
        borderRadius="5px"
        sx={props.outerSx}
      >
        <Box
          as={ChakraButton}
          {...(props as unknown)}
          backgroundColor={background}
          w="100%"
          h="100%"
          py={2}
          px={6}
          color={colorMode === 'light' ? 'blue' : 'white'}
          borderRadius="5px"
          onClick={(handleClick as unknown) as MouseEventHandler<HTMLDivElement>}
        >
          {content}
        </Box>
      </Box>
    );
  }

  if (props.variant === 'ghost') {
    return (
      <ChakraButton {...props} sx={props.outerSx} onClick={handleClick}>
        {content}
      </ChakraButton>
    );
  }

  return (
    <Box
      as={ChakraButton}
      {...(props as unknown)}
      type={props.type}
      className={props.className}
      py={2}
      px={6}
      width={props.width}
      color="white"
      fontWeight="bold"
      borderRadius="md"
      w={props.w}
      bgGradient="linear(to-r, #0F62FF, #6B5BD2)"
      _hover={{
        bgGradient: 'linear(to-r, #0F62FF, #6B5BD2)',
      }}
      onClick={(handleClick as unknown) as MouseEventHandler<HTMLDivElement>}
      rightIcon={props.rightIcon}
      leftIcon={props.leftIcon}
      sx={props.outerSx}
    >
      {content}
    </Box>
  );
};

export default Button;
