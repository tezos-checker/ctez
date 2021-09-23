import {
  Box,
  Flex,
  Stack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
} from '@chakra-ui/react';
import Swap from '../../components/Swap';
import Liquidity from '../../components/Liquidity';

const HomePage: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex height="calc(100vh - 72px)" alignItems="center">
      <Flex alignItems="center" m={24}>
        <Stack spacing={3} m={4}>
          <Text color={colorMode === 'light' ? 'darkgray' : 'white'} fontSize="sm">
            No governance, completely mechanical, straightforward.
          </Text>
          <Text color={colorMode === 'light' ? 'darkgray' : 'white'} fontSize="6xl" as="strong">
            Unlock liquidity on Tezos and stay in control
          </Text>
          <Text color={colorMode === 'light' ? 'darkgray' : 'white'} fontSize="md">
            ctez can be used directly in smart-contracts that would normally pool tez together
            without the thorny question of "who's baking".
          </Text>
        </Stack>

        <Box
          backgroundColor={colorMode === 'light' ? 'white' : 'cardbgdark'}
          fontWeight="500"
          color={colorMode === 'light' ? 'tabcolor' : 'darkheading'}
          minWidth="400px"
          maxWidth="400px"
          borderRadius={16}
          p={4}
          m={4}
        >
          <Tabs>
            <TabList>
              <Tab>Swap</Tab>
              <Tab>Liquidity</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Swap />
              </TabPanel>
              <TabPanel>
                <Liquidity />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Flex>
  );
};

export default HomePage;
