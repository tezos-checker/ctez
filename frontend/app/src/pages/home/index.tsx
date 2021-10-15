import { Flex, HStack, Stack, Text, useColorModeValue, useMediaQuery } from '@chakra-ui/react';
import Button from '../../components/button/Button';
import Trade from '../../components/Trade';

const HomePage: React.FC = () => {
  const textcolor = useColorModeValue('darkgray', 'white');
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);

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
            <Button variant="solid" w="50%">
              Enter App
            </Button>
            <Button variant="outline" w="50%">
              Learn more
            </Button>
          </HStack>
        </Stack>
        <Trade />
      </Flex>
    </Flex>
  );
};

export default HomePage;
