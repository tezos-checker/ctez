import { Center, Stack, Text, useMediaQuery } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import OvenStats from '../../../components/OvenCard/OvenStats';
import { useWallet } from '../../../wallet/hooks';
import {
  useSetAllOvensToStore,
  useSetCtezBaseStatsToStore,
  useSetOvenDataToStore,
} from '../../../hooks/setApiDataToStore';
import BakerInfo from '../../../components/OvenCard/BakerInfo';
import DepositorsInfo from '../../../components/OvenCard/DepositorsInfo';
import CollateralOverview from '../../../components/OvenOperations/CollateralOverview';
import MintableOverview from '../../../components/OvenOperations/MintableOverview';
import { useMyOvensSelector } from '../../../hooks/reduxSelectors';

const OvenIdPage: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  const { ovenId, address } = useParams<{ ovenId: string; address: string }>();
  const { oven } = useMyOvensSelector(userAddress, ovenId, address);
  useSetCtezBaseStatsToStore(userAddress);
  useSetOvenDataToStore(userAddress);
  useSetAllOvensToStore();
  const isImported = oven?.isImported;

  if (userAddress == null) {
    return (
      <Center>
        <Text>Connect your wallet to get started</Text>
      </Center>
    );
  }

  return (
    <Stack
      direction={largerScreen ? 'row' : 'column'}
      maxWidth={1200}
      mx="auto"
      my={4}
      p={4}
      w="100%"
      spacing={4}
    >
      <Stack direction="column" w={largerScreen ? '50%' : '100%'} spacing={4}>
        <OvenStats oven={oven} />
        {isImported === undefined && <BakerInfo oven={oven} />}

        {isImported === undefined && <DepositorsInfo oven={oven} />}
      </Stack>

      <Stack direction="column" w={largerScreen ? '50%' : '100%'} spacing={4}>
        <CollateralOverview oven={oven} />

        <MintableOverview oven={oven} />
      </Stack>
    </Stack>
  );
};

export default OvenIdPage;
