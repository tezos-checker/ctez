import { Box, Select, Spacer, Stack, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useMemo, useState } from 'react';
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
import SkeletonLayout from '../../components/skeleton';

const AllOvensContainer: React.FC = () => {
  useSetAllOvensToStore();
  let { data } = useAppSelector((state) => state.oven.allOvens);
  const { isLoading } = useAppSelector((state) => state.oven.allOvens);
  const sortbyoption = useAppSelector((state) => state.oven.sortByOption);
  const dataperpage = 10;
  console.log(data.length);
  const [currentPage, setCurrentPage] = useState(1);
  console.log(Math.ceil(data.length / dataperpage));
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(data.length / dataperpage); i += 1) {
    pageNumbers.push(i);
  }

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
    return <SkeletonLayout count={7} component="OvenCard" />;
  }
  const handleClick = (value: any) => {
    setCurrentPage(value);
  };

  const renderPageNumbers = pageNumbers.map((number) => {
    return (
      <Button
        _hover={{ cursor: 'pointer' }}
        value={number}
        key={number}
        variant="ghost"
        mr={3}
        bg="#B0B7C3"
        onClick={(e) => handleClick(number)}
      >
        {number}
      </Button>
    );
  });

  const indexOfLastOven = currentPage * dataperpage;
  const indexOfFirstOven = indexOfLastOven - dataperpage;
  const currentTodos = data.slice(indexOfFirstOven, indexOfLastOven);
  const renderOvens = currentTodos.map((oven) => {
    return <OvenCard key={oven.id} oven={oven} type="AllOvens" />;
  });

  return (
    <>
      {renderOvens}
      <Flex spacing={24} px={552} alignItems="center">
        {renderPageNumbers}
      </Flex>
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
  const { isMyOvensLoading } = useSetOvenDataToStore(userAddress);
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
          (isMyOvensLoading ? (
            <SkeletonLayout component="OvenCard" />
          ) : (
            ovens?.map((oven) => <OvenCard key={oven.address} oven={oven} type="MyOvens" />)
          ))}
      </Box>
    </Box>
  );
};

export default OvensPage;
