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
          spacing={5}
          pl={largerScreen ? 4 : 1}
          pr={largerScreen ? 0 : 1}
          textAlign={largerScreen ? 'left' : 'center'}
          alignItems={largerScreen ? 'left' : 'center'}
        >
          <Text
            opacity="0.5"
            color={textcolor}
            fontSize={largerScreen ? 'sm' : 'md'}
            mt={largerScreen ? '' : '185px'}
          >
            ctez, a Tezos public good
          </Text>
          <Text
            color={textcolor}
            fontSize={largerScreen ? '48px' : '20px'}
            as="strong"
            lineHeight="50px"
          >
            Unlock liquidity on Tezos and stay in control
          </Text>
          <Text opacity="0.5" color={textcolor} fontSize="md" pr={15}>
            ctez is a collateralized version of tez allowing you to use Tezos DeFi and delegate your
            tez simultaneously.
          </Text>
          <HStack
            mt={10}
            w={largerScreen ? '60%' : '90%'}
            justifyContent="space-between"
            spacing={largerScreen ? '24px' : '15px'}
          >
            <Button
              variant="solid"
              w="50%"
              onClick={() => dispatch(openModal(MODAL_NAMES.CREATE_OVEN))}
            >
              {buttonText}
            </Button>
            <Button variant="ghost" w="50%">
              <Link to="/faq">
                <Button variant="outline" w={largerScreen ? '200px' : '180px'}>
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
