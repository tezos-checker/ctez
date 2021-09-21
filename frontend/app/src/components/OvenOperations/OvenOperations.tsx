import {
  Divider,
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import MintOrRepay from './MintOrRepay';
import Withdraw from './Withdraw';
import Deposit from './Deposit';

interface IOvenOperationsProps {
  largerScreen: boolean;
}

const OvenOperations: React.FC<IOvenOperationsProps> = (props) => {
  const dividerEl = useMemo(
    () => (
      <Flex alignItems="center" direction="row">
        <Divider />

        <Text ml={4} mr={4}>
          OR
        </Text>

        <Divider />
      </Flex>
    ),
    [],
  );

  return (
    <Stack
      w={props.largerScreen ? '50%' : '100%'}
      p={8}
      spacing={4}
      backgroundColor="white"
      borderRadius={16}
    >
      <Tabs>
        <TabList justifyContent="space-evenly">
          <Tab color="#4E5D78" fontWeight="700">
            Mint & Deposit
          </Tab>
          <Tab color="#4E5D78" fontWeight="700">
            Withdraw & Repay
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Stack spacing={6}>
              <Deposit />

              {dividerEl}

              <MintOrRepay type="mint" />
            </Stack>
          </TabPanel>

          <TabPanel>
            <Stack spacing={6}>
              <Withdraw />

              {dividerEl}

              <MintOrRepay type="repay" />
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default OvenOperations;
