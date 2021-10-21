import { Flex, HStack, Stack, Text, useColorModeValue, useMediaQuery } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/button/Button';
import Trade from '../../components/Trade';
import { ADD_BTN_TXT, TAddBtnTxt } from '../../constants/liquidity';
import { MODAL_NAMES } from '../../constants/modals';
import { BUTTON_TXT, TButtonText } from '../../constants/swap';
import { openModal } from '../../redux/slices/UiSlice';
import { useAppDispatch } from '../../redux/store';
import { useWallet } from '../../wallet/hooks';

const HomePage: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [buttonText, setButtonText] = useState<TButtonText>(BUTTON_TXT.CONNECT);
  const textcolor = useColorModeValue('darkgray', 'white');
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!userAddress) {
      setButtonText(BUTTON_TXT.CONNECT);
    } else {
      setButtonText(BUTTON_TXT.CREATE_OVEN);
    }
  }, [buttonText, userAddress]);

  return (
    <Flex maxWidth={1200} mx="auto" height="calc(100vh - 72px)" alignItems="center">
      <Flex alignItems="center" flexDirection={largerScreen ? 'row' : 'column'}>
        <Stack
          spacing={3}
          pl={largerScreen ? 4 : 0}
          textAlign={largerScreen ? 'left' : 'center'}
          alignItems={largerScreen ? 'left' : 'center'}
        >
          <Text opacity="0.5" color={textcolor} fontSize="sm">
            No governance, completely mechanical, straightforward.
          </Text>
          <Text color={textcolor} fontSize="48px" as="strong" line-height="16px">
            Unlock liquidity on Tezos and stay in control
          </Text>
          <Text opacity="0.5" color={textcolor} fontSize="md" pr={15}>
            ctez can be used directly in smart-contracts that would normally pool tez together
            without the thorny question of "who's baking".
          </Text>
          <HStack mt={6} w="60%" justifyContent="space-between" spacing="24px">
            <Button
              variant="solid"
              w="50%"
              onClick={() => dispatch(openModal(MODAL_NAMES.CREATE_OVEN))}
            >
              {buttonText}
            </Button>
            <Button variant="ghost" w="50%">
              <Link to="/faq">
                <Button variant="outline" w="200px">
                  Learn more
                </Button>
              </Link>
            </Button>
          </HStack>
        </Stack>
        <Trade />
      </Flex>
    </Flex>
  );
};

export default HomePage;
