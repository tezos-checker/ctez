import { Box, Select, Spacer, Stack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import OvenCard from '../../components/OvenCard/OvenCard';
import MyOvenCard from '../../components/OvenCard/MyOvenCard';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useWallet } from '../../wallet/hooks';
import { openModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';
import {
  useSetAllOvensToStore,
  useSetCtezBaseStatsToStore,
  useSetExtOvensToStore,
  useSetOvenDataToStore,
} from '../../hooks/setApiDataToStore';
import Button from '../../components/button/Button';

const AllOvensContainer: React.FC = () => {
  useSetAllOvensToStore();
  const { data, isLoading } = useAppSelector((state) => state.oven.allOvens);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      {data.map((oven) => (
        <OvenCard key={oven.id} oven={oven} />
      ))}
    </>
  );
};

const OvensPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const background = useColorModeValue('white', 'cardbgdark');
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
        <Select color="#B0B7C3" placeholder="Sort by:" w={186} backgroundColor={background}>
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
        {!isMyOven && <AllOvensContainer />}

        {isMyOven && ovens?.map((oven) => <MyOvenCard key={oven.address} oven={oven} />)}
      </Box>
    </Box>
  );
};

export default OvensPage;
