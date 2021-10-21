import React, { MouseEvent as ReactMouseEvent } from 'react';
import { Text, Flex, Box, useToast, useColorModeValue } from '@chakra-ui/react';
import { MdContentCopy } from 'react-icons/md';

export interface Props {
  address: string;
  placement?: 'left' | 'right';
  spaced?: boolean;
}

const CopyAddress: React.FC<Props> = ({ children, address, placement, spaced }) => {
  const toast = useToast();
  const cardbg = useColorModeValue('white', 'cardbgdark');

  function onClickCopy(e: ReactMouseEvent<SVGElement, MouseEvent>) {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(address);
    return toast({
      position: 'bottom',
      render() {
        return (
          <Flex borderRadius={14} background={cardbg}>
            <Text m="auto">Copied to clipboard.</Text>
          </Flex>
        );
      },
    });
  }

  return (
    <Box>
      {address && (
        <Flex
          alignItems="center"
          justify={spaced ? 'space-between' : 'normal'}
          flexDirection={placement === 'left' ? 'row-reverse' : 'row'}
        >
          {children && children}
          <Flex
            mr={children && placement === 'left' ? 1 : 0}
            ml={children && placement === 'right' ? 1 : 0}
          >
            <MdContentCopy
              cursor="pointer"
              onClick={(event) => {
                onClickCopy(event);
              }}
            />
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

const defaultProps: Props = {
  address: '',
  placement: 'right',
  spaced: false,
};

CopyAddress.defaultProps = defaultProps;

export default CopyAddress;
