import {
  Flex,
  Box,
  Icon,
  Select,
  Spacer,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import { useWallet } from '../../wallet/hooks';
import { openModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';
import { useSetCtezBaseStatsToStore } from '../../hooks/setApiDataToStore';
import Button from '../../components/button/Button';
import { setSortBy } from '../../redux/slices/OvenSlice';
import AllOvensContainer from './AllOvensContainer';
import MyOvensContainer from './MyOvensContainer';

const OvensPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const background = useColorModeValue('white', 'cardbgdark');
  const [mobileScreen] = useMediaQuery(['(max-width: 600px)']);

  const [{ pkh: userAddress }] = useWallet();
  useSetCtezBaseStatsToStore(userAddress);

  const isMyOven = useMemo(() => {
    return location.pathname === '/myovens' || location.pathname === '/myovens/';
  }, [location]);

  const SetSortType = (value: string) => {
    dispatch(setSortBy(value));
  };

  return (
    <Box maxWidth={1200} mx="auto" my={4} p={4}>
      <Flex direction={mobileScreen ? 'column' : 'row'}>
        <Select
          color="#B0B7C3"
          placeholder="Sort by:"
          w={186}
          backgroundColor={background}
          onChange={(e) => SetSortType(e.target.value)}
        >
          <option value="Oven Balance">Value</option>
          <option value="utilization">Outstanding</option>
        </Select>

        <Spacer />

        <Flex mt={mobileScreen ? 2 : 0}>
          <Button
            rightIcon={<BsArrowRight />}
            variant="outline"
            onClick={() => dispatch(openModal(MODAL_NAMES.TRACK_OVEN))}
            outerSx={{ mr: 2 }}
          >
            Track Oven
          </Button>

          <Button
            leftIcon={<Icon as={MdAdd} w={6} h={6} />}
            variant="solid"
            onClick={() => dispatch(openModal(MODAL_NAMES.CREATE_OVEN))}
          >
            Create Oven
          </Button>
        </Flex>
      </Flex>

      <Box d="table" w="100%" mt={16}>
        {!isMyOven && <AllOvensContainer />}

        {isMyOven && <MyOvensContainer userAddress={userAddress} />}
      </Box>
    </Box>
  );
};

export default OvensPage;
