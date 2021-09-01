import { Box, Flex, Stack, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

const HomePage: React.FC = () => {
  return (
    <Flex height="100vh" alignItems="center" background="gray.100">
      <Flex m={24}>
        <Stack spacing={3} m={4}>
          <Text fontSize="sm">No governance, completely mechanical, straightforward.</Text>
          <Text fontSize="6xl" as="strong">
            Unlock liquidity on Tezos and stay in control
          </Text>
          <Text fontSize="md">
            ctez can be used directly in smart-contracts that would normally pool tez together
            without the thorny question of "who's baking".
          </Text>
        </Stack>

        <Box background="white" minWidth="400px" maxWidth="400px" borderRadius={16} p={4} m={4}>
          <Tabs>
            <TabList>
              <Tab>Swap</Tab>
              <Tab>Liquidity</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </TabPanel>
              <TabPanel>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores, beatae.</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Flex>
  );
};

export default HomePage;
