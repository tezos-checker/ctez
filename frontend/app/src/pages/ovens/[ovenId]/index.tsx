import { Center, Stack, Text, useMediaQuery } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import OvenStats from '../../../components/OvenCard/OvenStats';
import { useWallet } from '../../../wallet/hooks';
import BakerInfo from '../../../components/OvenCard/BakerInfo';
import DepositorsInfo from '../../../components/OvenCard/DepositorsInfo';
import CollateralOverview from '../../../components/OvenOperations/CollateralOverview';
import MintableOverview from '../../../components/OvenOperations/MintableOverview';
import { useOvenDatum } from '../../../api/queries';

const OvenIdPage: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  const { address } = useParams<{ address: string }>();
  const { data: oven } = useOvenDatum(address);

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

        <BakerInfo oven={oven} />

        <DepositorsInfo oven={oven} />
      </Stack>

      <Stack direction="column" w={largerScreen ? '50%' : '100%'} spacing={4}>
        <CollateralOverview oven={oven} />

        <MintableOverview oven={oven} />
      </Stack>
    </Stack>
  );
};

export default OvenIdPage;
