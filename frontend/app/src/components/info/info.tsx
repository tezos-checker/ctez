import React from 'react';
import { useColorMode, useColorModeValue, Flex, Icon, Text, Box, BoxProps } from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';

interface IInfoProps extends BoxProps {
  children: React.ReactNode;
}

const Info: React.FC<IInfoProps> = (props) => {
  const { colorMode } = useColorMode();
  const background = useColorModeValue('white', 'cardbgdark');
  const cardbg = useColorModeValue('bg4', 'darkblue');

  return (
    <Box mt={props.mt} ml={props.ml} zIndex={2}>
      <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
        <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
        <Text color="gray.500" fontSize="xs" ml={2}>
          {props.children}
        </Text>
      </Flex>
    </Box>
  );
};

export default Info;
