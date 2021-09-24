import {
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import Swap from '../../components/Swap';
import Liquidity from '../../components/Liquidity';

const TradePage: React.FC = () => {
  const tabcolor = useColorModeValue('tabcolor', 'darkheading');
  const background = useColorModeValue('white', 'cardbgdark');
  return (
    <Flex height="calc(100vh - 72px)" alignItems="center" justifyContent="center">
      <Box
        fontWeight="500"
        backgroundColor={background}
        color={tabcolor}
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
  );
};

export default TradePage;
