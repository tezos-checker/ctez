import { Box, Flex, Stack, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Swap from '../../components/Swap';
import Liquidity from '../../components/Liquidity';

const HomePage: React.FC = () => {
  return (
    <Flex height="calc(100vh - 72px)" alignItems="center">
      <Flex alignItems="center" m={24}>
        <Stack spacing={3} m={4}>
          <Text fontSize="sm">No governance, completely mechanical, straightforward.</Text>
          <Text color="#62737F" fontSize="6xl" as="strong">
            Unlock liquidity on Tezos and stay in control
          </Text>
          <Text color="#62737F" fontSize="md">
            ctez can be used directly in smart-contracts that would normally pool tez together
            without the thorny question of "who's baking".
          </Text>
        </Stack>

        <Box
          backgroundColor="white"
          fontWeight="500"
          color="gray.500"
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
