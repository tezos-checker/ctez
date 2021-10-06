import { Stack, useMediaQuery } from '@chakra-ui/react';
import OvenInfo from '../../../components/OvenCard/OvenInfo';
import OvenStats from '../../../components/OvenCard/OvenStats';
import { useWallet } from '../../../wallet/hooks';
import {
  useSetCtezBaseStatsToStore,
  useSetOvenDataToStore,
} from '../../../hooks/setApiDataToStore';
import CollateralOverview from '../../../components/OvenOperations/CollateralOverview';
import MintableOverview from '../../../components/OvenOperations/MintableOverview';

interface IOvenOperationsProps {
  largerScreen: boolean;
}

const OvenOperations: React.FC<IOvenOperationsProps> = (props) => {
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);

  const [{ pkh: userAddress }] = useWallet();
  useSetCtezBaseStatsToStore(userAddress);
  useSetOvenDataToStore(userAddress);

  return (
    <Stack direction="column" w={props.largerScreen ? '50%' : '100%'} spacing={4}>
      <CollateralOverview />
      <MintableOverview />
    </Stack>
  );
};

export default OvenOperations;
