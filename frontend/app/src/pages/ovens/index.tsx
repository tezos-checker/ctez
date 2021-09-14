import { Box, Button, Select, Spacer, Stack } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { mockOvens } from './mock';
import OvenCard from '../../components/OvenCard/OvenCard';
import MyOvenCard from '../../components/OvenCard/MyOvenCard';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useWallet } from '../../wallet/hooks';
import { useCtezBaseStats, useOvenData } from '../../api/queries';
import { CTEZ_ADDRESS } from '../../utils/globals';
import { getExternalOvens } from '../../utils/ovenUtils';
import { UserOvenStats } from '../../interfaces';
import { OvenSlice } from '../../redux/slices/OvenSlice';

const OvensPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [extOvens, setExtOvens] = useState<string[]>();
  const originalTarget = useAppSelector((state) => Number(state.stats.baseStats?.originalTarget));
  const { showActions } = useAppSelector((state) => state.oven);
  const [{ pkh: userAddress }] = useWallet();
  const { data: ovenData, isLoading } = useOvenData(userAddress, extOvens);
  const { data: baseStats } = useCtezBaseStats(userAddress);

  useEffect(() => {
    if (userAddress && CTEZ_ADDRESS) {
      setExtOvens(getExternalOvens(userAddress, CTEZ_ADDRESS));
    }
  }, [userAddress]);

  useEffect(() => {
    if (ovenData && ovenData.length > 0) {
      const ovenUserData: UserOvenStats = ovenData.reduce(
        (acc, item) => {
          if (!item.isExternal) {
            acc.ctez += item.ctez_outstanding.shiftedBy(-6).toNumber();
            acc.xtz += item.tez_balance.shiftedBy(-6).toNumber();
            return acc;
          }
          return acc;
        },
        { xtz: 0, ctez: 0, totalOvens: ovenData.length },
      );
      dispatch(OvenSlice.actions.setUserOvenData(ovenUserData));
    }
  }, [dispatch, ovenData]);

  const isMyOven = useMemo(() => {
    return location.pathname === '/ovens/mine';
  }, [location]);

  return (
    <Box m={2} p={8}>
      <Stack direction="row">
        <Select placeholder="Sort by:" w={186} backgroundColor="white">
          {/* TODO */}
          <option value="option1">Value</option>
          <option value="option2">Utilization</option>
          <option value="option3">Option 3</option>
        </Select>

        <Spacer />
        <Button rightIcon={<BsArrowRight />} variant="outline">
          Track Oven
        </Button>
        <Button leftIcon={<MdAdd />} variant="solid">
          Create Oven
        </Button>
      </Stack>

      <Box d="table" w="100%" mt={16}>
        {!isMyOven && mockOvens.map((oven) => <OvenCard key={oven.ovenId} oven={oven} />)}

        {isMyOven && mockOvens.map((oven) => <MyOvenCard key={oven.ovenId} oven={oven} />)}
      </Box>
    </Box>
  );
};

export default OvensPage;
