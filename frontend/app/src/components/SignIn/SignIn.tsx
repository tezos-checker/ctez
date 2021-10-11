import {
  Button as ChakraButton,
  Flex,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { BigNumber } from 'bignumber.js';
import Button from '../button/Button';
import { trimAddress } from '../../utils/addressUtils';
import { useWallet } from '../../wallet/hooks';
import { getBeaconInstance } from '../../wallet';
import { APP_NAME, NETWORK } from '../../utils/globals';
import { setWalletProvider } from '../../contracts/client';
import { OvenSlice } from '../../redux/slices/OvenSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useUserBalance, useUserLqtData } from '../../api/queries';
import Identicon from '../avatar/Identicon';

const SignIn: React.FC = () => {
  const [{ pkh: userAddress, network }, setWallet, disconnectWallet] = useWallet();
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: balance } = useUserBalance(userAddress);
  const { data: userLqtData } = useUserLqtData(userAddress);
  const userOvenData = useAppSelector((state) => state.oven.userOvenData);

  const formatNumber = useCallback((number?: number) => {
    if (typeof number !== 'number') {
      return null;
    }

    return new BigNumber(number).shiftedBy(-6).toNumber();
  }, []);

  const connectWallet = async () => {
    const newWallet = await getBeaconInstance(APP_NAME, true, NETWORK);
    newWallet?.wallet && setWalletProvider(newWallet.wallet);
    newWallet && setWallet(newWallet);
  };

  const onDisconnectWallet = () => {
    dispatch(OvenSlice.actions.setUserOvenData({ ctez: 0, xtz: 0, totalOvens: 0 }));
    disconnectWallet();
  };

  if (!userAddress) {
    return (
      <Button
        border="1px solid rgba(0, 0, 0, 0.07)"
        backgroundColor="transparent"
        onClick={connectWallet}
      >
        Connect wallet
      </Button>
    );
  }

  return (
    <>
      <Popover
        placement="bottom"
        computePositionOnMount
        isOpen={isOpen}
        onClose={onClose}
        offset={[0, -40]}
      >
        <PopoverTrigger>
          <ChakraButton w={0} minW={0} p={0} />
        </PopoverTrigger>
        <PopoverContent mx={4}>
          <PopoverCloseButton />
          <PopoverHeader>
            <Flex alignItems="center">
              <Identicon type="tzKtCat" seed={userAddress} avatarSize="sm" />
              <Text ml={2}>{trimAddress(userAddress, 'medium')}</Text>
            </Flex>
          </PopoverHeader>
          <PopoverBody>
            <Table variant="unstyled" size="sm">
              <Tbody>
                {typeof balance !== 'undefined' && (
                  <>
                    <Tr>
                      <Td>ꜩ:</Td>
                      <Td textAlign="right">{formatNumber(balance.xtz)}</Td>
                    </Tr>
                    <Tr>
                      <Td>cꜩ:</Td>
                      <Td textAlign="right">{formatNumber(balance.ctez)}</Td>
                    </Tr>
                  </>
                )}
                {typeof userOvenData !== 'undefined' && (
                  <>
                    <Tr>
                      <Td>ꜩ in ovens:</Td>
                      <Td textAlign="right">{formatNumber(userOvenData?.xtz)}</Td>
                    </Tr>
                    <Tr>
                      <Td>cꜩ outstanding:</Td>
                      <Td textAlign="right">{formatNumber(userOvenData?.ctez)}</Td>
                    </Tr>
                  </>
                )}
                {typeof userLqtData?.lqt !== 'undefined' && (
                  <Tr>
                    <Td>LQT:</Td>
                    <Td textAlign="right">{formatNumber(userLqtData?.lqt)}</Td>
                  </Tr>
                )}
                {typeof userLqtData?.lqtShare !== 'undefined' && (
                  <Tr>
                    <Td>LQT Pool share:</Td>
                    <Td textAlign="right">{userLqtData?.lqtShare}%</Td>
                  </Tr>
                )}
              </Tbody>

              <TableCaption mt={0}>{network}</TableCaption>
            </Table>
          </PopoverBody>

          <PopoverFooter>
            <Button mx="auto" variant="outline" onClick={onDisconnectWallet}>
              Sign Out
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>

      <Button border="1px solid rgba(0, 0, 0, 0.07)" backgroundColor="transparent" onClick={onOpen}>
        {trimAddress(userAddress)}
      </Button>
    </>
  );
};

export default SignIn;
