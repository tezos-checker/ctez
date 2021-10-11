import { Flex, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import Button from '../../components/button/Button';
import Trade from '../../components/Trade';

const HomePage: React.FC = () => {
  const tabcolor = useColorModeValue('tabcolor', 'darkheading');
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('darkgray', 'white');

  return (
    <Flex height="calc(100vh - 72px)" alignItems="center">
      <Flex alignItems="center" m={24}>
        <Stack spacing={3} m={4}>
          <Text color={textcolor} fontSize="sm">
            No governance, completely mechanical, straightforward.
          </Text>
          <Text color={textcolor} fontSize="6xl" as="strong">
            Unlock liquidity on Tezos and stay in control
          </Text>
          <Text color={textcolor} fontSize="md">
            ctez can be used directly in smart-contracts that would normally pool tez together
            without the thorny question of "who's baking".
          </Text>
          <HStack w="65%" justifyContent="space-between" spacing="24px">
            <Button variant="solid" w="100%">
              Enter App
            </Button>
            <Button variant="outline" w="100%">
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
