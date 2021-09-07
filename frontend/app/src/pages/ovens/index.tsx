import { Box, Button, Select, Spacer, Stack } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { BsArrowRight } from 'react-icons/bs';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { mockOvens } from './mock';
import OvenCard from '../../components/OvenCard/OvenCard';

const OvensPage: React.FC = () => {
  const location = useLocation();

  const isMyOven = useMemo(() => {
    return location.pathname === '/ovens/mine';
  }, [location]);

  return (
    <Box m={2} p={8} backgroundColor="gray.100">
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
        {mockOvens.map((oven) => (
          <OvenCard key={oven.ovenId} oven={oven} isMyOven={isMyOven} />
        ))}
      </Box>
    </Box>
  );
};

export default OvensPage;
