import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useMediaQuery,
} from '@chakra-ui/react';
import Swap from './Swap';
import Liquidity from './Liquidity';
import { ReactComponent as tune } from '../../assets/images/sidebar/tune_settings.svg';
import { Settings } from './Settings/Settings';
import { useThemeColors } from '../../hooks/utilHooks';

const Trade: React.FC = () => {
  const [tabcolor, background] = useThemeColors(['tradebg', 'cardbg']);
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);

  return (
    <Box
      fontWeight="500"
      backgroundColor={background}
      color={tabcolor}
      minWidth="400px"
      maxWidth="400px"
      borderRadius={16}
      p={4}
      mx={largerScreen ? 4 : 1}
      my={4}
      mt={20}
    >
      <Tabs>
        <TabList>
          <Tab>Swap</Tab>
          <Tab>Liquidity</Tab>
          <Tab position="relative" left="147">
            <Icon w={6} h={6} color="light.tradebg" as={tune} />
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
