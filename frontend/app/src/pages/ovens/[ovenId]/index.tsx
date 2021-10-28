import { Center, Stack, Text, useMediaQuery } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import OvenStats from '../../../components/OvenCard/OvenStats';
import { useWallet } from '../../../wallet/hooks';
import BakerInfo from '../../../components/OvenCard/BakerInfo';
import DepositorsInfo from '../../../components/OvenCard/DepositorsInfo';
import CollateralOverview from '../../../components/OvenOperations/CollateralOverview';
import MintableOverview from '../../../components/OvenOperations/MintableOverview';
import { useOvenDataByAddresses } from '../../../api/queries';
import { AllOvenDatum } from '../../../interfaces';

const OvenIdPage: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  const { address } = useParams<{ address: string }>();
  const [queryResult] = useOvenDataByAddresses([address]);

  // ? for type casting
  const oven = useMemo(() => queryResult.data as AllOvenDatum | undefined, [queryResult]);

  const isImported = useMemo(() => oven?.key.owner !== userAddress, [oven?.key.owner, userAddress]);

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
        <OvenStats oven={oven} isImported={isImported} />

        <BakerInfo oven={oven} isImported={isImported} />

        <DepositorsInfo oven={oven} isImported={isImported} />
      </Stack>

      <Stack direction="column" w={largerScreen ? '50%' : '100%'} spacing={4}>
        <CollateralOverview oven={oven} isImported={isImported} />

        <MintableOverview oven={oven} isImported={isImported} />
      </Stack>
    </Stack>
  );
};

export default OvenIdPage;
