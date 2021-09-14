import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { MdChevronRight } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { OvenSerializable } from '../../interfaces';
import ProgressPill from './ProgressPill';

const MyOvenCard: React.FC<{ oven: OvenSerializable; isMyOven: boolean }> = ({ oven }) => {
  const renderItems = () => {
    const items = [
      { label: 'Num Oven', value: `#${oven.ovenId}` },
      { label: 'Current utilization', value: `${oven.tez_balance}%` },
      { label: 'Oven Balance', value: `${oven.tez_balance} XTZ` },
      { label: 'Outstanding ctez', value: `${oven.ctez_outstanding} cTEZ` },
    ];

    return items.map((item) => (
      <Box key={item.label}>
        <Text mb={2}>{item.value}</Text>
        <Text fontSize="xs">{item.label}</Text>
      </Box>
    ));
  };

  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor="white"
      transition="0.4s"
      _hover={{ boxShadow: '0 23px 66px 4px rgba(176, 183, 195, 0.25)', cursor: 'pointer' }}
      as={Link}
      to={`${oven.ovenId}`}
    >
      <Flex direction="column" w="70%">
        <Flex mb={4} mr={16} justifyContent="space-between">
          {renderItems()}
        </Flex>
        <ProgressPill value={74} />
      </Flex>
      <Flex alignItems="center">
        <Button variant="outline" rightIcon={<MdChevronRight />}>
          Manage Oven
        </Button>
      </Flex>
    </Flex>
  );
};

export default MyOvenCard;
