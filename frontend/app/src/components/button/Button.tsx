import React, { MouseEventHandler } from 'react';
import { Button as ChakraButton, ButtonGroup, useColorMode, Text, Box } from '@chakra-ui/react';
import { ButtonProps } from '@chakra-ui/button';

export interface IButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const Button: React.FC<IButtonProps> = (props) => {
  if (props.variant === 'outline') {
    return (
      <Box
        as={ChakraButton}
        type={props.type}
        bgGradient="linear(to-r, #0F62FF, #6B5BD2)"
        _hover={{
          bgGradient: 'linear(to-r, #0F62FF, #6B5BD2)',
        }}
        p="1px"
        w={props.w}
        onClick={(props.onClick as unknown) as MouseEventHandler<HTMLDivElement>}
      >
        <Box
          backgroundColor="gray.100"
          w="100%"
          h="100%"
          p={2}
          pr={6}
          pl={6}
          color="#2761F4"
          borderRadius="5px"
        >
          {props.children}
        </Box>
      </Box>
    );
  }
  return (
    <Box
      as={ChakraButton}
      type={props.type}
      p={2}
      width={props.width}
      color="white"
      fontWeight="bold"
      borderRadius="md"
      w={props.w}
      bgGradient="linear(to-r, #0F62FF, #6B5BD2)"
      _hover={{
        bgGradient: 'linear(to-r, #0F62FF, #6B5BD2)',
      }}
      onClick={(props.onClick as unknown) as MouseEventHandler<HTMLDivElement>}
      rightIcon={props.rightIcon}
      leftIcon={props.leftIcon}
    >
      {props.children}
    </Box>
  );
};

export default Button;
