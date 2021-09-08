import { Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import MintAndDeposit from './MintAndDeposit';
import WithdrawAndRepay from './WithdrawAndRepay';

interface IOvenOperationsProps {
  largerScreen: boolean;
}

const OvenOperations: React.FC<IOvenOperationsProps> = (props) => {
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
          <Tab>Mint & Deposit</Tab>
          <Tab>Withdraw & Repay </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <MintAndDeposit />
          </TabPanel>
          <TabPanel>
            <WithdrawAndRepay />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default OvenOperations;
