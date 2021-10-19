import {
  Button as ChakraButton,
  Flex,
  Icon,
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
import { useCallback, MouseEvent, useState } from 'react';
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
import { formatNumber as formatNumberUtil } from '../../utils/numbers';
import { ReactComponent as copy } from '../../assets/images/sidebar/content_copy.svg';

const SignIn: React.FC = () => {
  const [{ pkh: userAddress, network }, setWallet, disconnectWallet] = useWallet();
  const dispatch = useAppDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: balance } = useUserBalance(userAddress);
  const { data: userLqtData } = useUserLqtData(userAddress);
  const userOvenData = useAppSelector((state) => state.oven.userOvenData);

  const formatNumber = useCallback((number?: number, shiftedBy = -6) => {
    if (typeof number !== 'number') {
      return null;
    }

    return formatNumberUtil(number, shiftedBy);
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
              <Text onClick={() => navigator.clipboard.writeText(userAddress)} ml={2}>
                {trimAddress(userAddress, 'medium')}
              </Text>
              <Icon
                onClick={() => navigator.clipboard.writeText(userAddress)}
                ml={2}
                w={3}
                h={3}
                color="#62737F"
                _hover={{ cursor: 'pointer' }}
                as={copy}
              />
            </Flex>
          </PopoverHeader>
          <PopoverBody>
            <Table variant="unstyled" size="sm">
              <Tbody>
                {typeof balance !== 'undefined' && (
                  <>
                    <Tr>
                      <Td>ꜩ:</Td>
                      <Td textAlign="right">{formatNumber(balance.xtz, 0)}</Td>
                    </Tr>
                    <Tr>
                      <Td>cꜩ:</Td>
                      <Td textAlign="right">{formatNumber(balance.ctez, 0)}</Td>
                    </Tr>
                  </>
                )}
                {typeof balance !== 'undefined' && (
                  <>
                    <Tr>
                      <Td>ꜩ in ovens:</Td>
                      <Td textAlign="right">{formatNumber(balance.tezInOvens, 0)}</Td>
                    </Tr>
                    <Tr>
                      <Td>cꜩ outstanding:</Td>
                      <Td textAlign="right">{formatNumber(balance.ctezOutstanding, 0)}</Td>
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
