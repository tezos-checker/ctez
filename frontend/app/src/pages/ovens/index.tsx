import { Box, Select, Spacer, Stack, Icon } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { mockOvens } from './mock';
import OvenCard from '../../components/OvenCard/OvenCard';
import MyOvenCard from '../../components/OvenCard/MyOvenCard';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useWallet } from '../../wallet/hooks';
import { openModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';
import {
  useSetCtezBaseStatsToStore,
  useSetExtOvensToStore,
  useSetOvenDataToStore,
} from '../../hooks/setApiDataToStore';
import Button from '../../components/button/Button';

const OvensPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const originalTarget = useAppSelector((state) => Number(state.stats.baseStats?.originalTarget));
  const { ovens } = useAppSelector((state) => state.oven);
  const [{ pkh: userAddress }] = useWallet();
  useSetCtezBaseStatsToStore(userAddress);
  useSetOvenDataToStore(userAddress);
  useSetExtOvensToStore(userAddress);

  const isMyOven = useMemo(() => {
    return location.pathname === '/myovens';
  }, [location]);

  return (
    <Box m={2} p={8}>
      <Stack direction="row">
        <Select color="#B0B7C3" placeholder="Sort by:" w={186} backgroundColor="white">
          {/* TODO */}
          <option value="option1">Value</option>
          <option value="option2">Utilization</option>
          <option value="option3">Option 3</option>
        </Select>

        <Spacer />
        <Button
          rightIcon={<BsArrowRight />}
          variant="outline"
          w="20%"
          onClick={() => dispatch(openModal(MODAL_NAMES.TRACK_OVEN))}
        >
          Track Oven
        </Button>
        <Button
          leftIcon={<Icon as={MdAdd} w={6} h={6} />}
          variant="solid"
          w="20%"
          onClick={() => dispatch(openModal(MODAL_NAMES.CREATE_OVEN))}
        >
          Create Oven
        </Button>
      </Stack>

      <Box d="table" w="100%" mt={16}>
        {!isMyOven && mockOvens.map((oven) => <OvenCard key={oven.ovenId} oven={oven} />)}

        {isMyOven && ovens?.map((oven) => <MyOvenCard key={oven.address} oven={oven} />)}
      </Box>
    </Box>
  );
};

export default OvensPage;
