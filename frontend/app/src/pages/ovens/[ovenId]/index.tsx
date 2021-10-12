import { Stack, useMediaQuery } from '@chakra-ui/react';
import { BigNumber } from 'bignumber.js';
import { useParams } from 'react-router-dom';
import OvenStats from '../../../components/OvenCard/OvenStats';
import { useWallet } from '../../../wallet/hooks';
import {
  useSetCtezBaseStatsToStore,
  useSetOvenDataToStore,
} from '../../../hooks/setApiDataToStore';
import BakerInfo from '../../../components/OvenCard/BakerInfo';
import DepositorsInfo from '../../../components/OvenCard/DepositorsInfo';
import CollateralOverview from '../../../components/OvenOperations/CollateralOverview';
import MintableOverview from '../../../components/OvenOperations/MintableOverview';
import { useAppSelector } from '../../../redux/store';

const OvenIdPage: React.FC = () => {
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  const { ovenId } = useParams<{ ovenId: string }>();
  const oven = useAppSelector((state) =>
    state.oven.ovens.find((x) => {
      const ovenIdFromStore = new BigNumber(x.ovenId);
      return ovenId === ovenIdFromStore.toString();
    }),
  );

  const [{ pkh: userAddress }] = useWallet();

  useSetCtezBaseStatsToStore(userAddress);
  useSetOvenDataToStore(userAddress);

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
