import {
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import Swap from './Swap';
import Liquidity from './Liquidity';
import { ReactComponent as tune } from '../../assets/images/sidebar/tune_settings.svg';
import { Settings } from './Settings/Settings';

const Trade: React.FC = () => {
  const tabcolor = useColorModeValue('darkgray', 'darkheading');
  const background = useColorModeValue('white', 'cardbgdark');
  return (
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
          <Tab position="relative" left="147">
            <Icon w={6} h={6} color="#62737F" as={tune} />
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Swap />
          </TabPanel>
          <TabPanel>
            <Liquidity />
          </TabPanel>
          <TabPanel>
            <Settings />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Trade;
