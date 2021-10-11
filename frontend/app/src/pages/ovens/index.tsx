import { Box, Select, Spacer, Stack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import OvenCard from '../../components/OvenCard/OvenCard';
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
import { setSortBy } from '../../redux/slices/OvenSlice';

const AllOvensContainer: React.FC = () => {
  useSetAllOvensToStore();
  let { data } = useAppSelector((state) => state.oven.allOvens);
  const { isLoading } = useAppSelector((state) => state.oven.allOvens);
  const sortbyoption = useAppSelector((state) => state.oven.sortByOption);

  if (sortbyoption === 'Oven Balance') {
    data = data
      .slice()
      .sort((a, b) => (Number(a.value.tez_balance) < Number(b.value.tez_balance) ? 1 : -1));
  }
  if (sortbyoption === 'Outstanding') {
    data = data
      .slice()
      .sort((a, b) =>
        Number(a.value.ctez_outstanding) < Number(b.value.ctez_outstanding) ? 1 : -1,
      );
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      {data.map((oven) => (
        <OvenCard key={oven.id} oven={oven} type="allOvens" />
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

  const SetSortType = (value: string) => {
    dispatch(setSortBy(value));
  };

  return (
    <Box m={2} p={8}>
      <Stack direction="row">
        <Select
          color="#B0B7C3"
          placeholder="Sort by:"
          w={186}
          backgroundColor={background}
          onChange={(e) => SetSortType(e.target.value)}
        >
          {/* TODO */}
          <option value="Oven Balance">Value</option>
          <option value="Outstanding">Utilization</option>
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

        {isMyOven &&
          ovens?.map((oven) => <OvenCard key={oven.address} oven={oven} type="myOvens" />)}
      </Box>
    </Box>
  );
};

export default OvensPage;
