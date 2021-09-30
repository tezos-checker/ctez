import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { MdChevronRight } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { Oven } from '../../interfaces';
import ProgressPill from './ProgressPill';
import Button from '../button/Button';

const MyOvenCard: React.FC<{ oven: Oven }> = ({ oven }) => {
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');

  const renderItems = () => {
    const items = [
      { label: 'Num Oven', value: `#${oven.ovenId}` },
      { label: 'Current utilization', value: `${oven.tez_balance}%` },
      { label: 'Oven Balance', value: `${oven.tez_balance} XTZ` },
      {
        label: 'Outstanding ctez',
        value: `${oven.ctez_outstanding} cTEZ`,
      },
    ];

    return items.map((item) => (
      <Box key={item.label}>
        <Text fontWeight="600" color={textcolor} mb={2}>
          {item.value}
        </Text>
        <Text fontWeight="500" color="#B0B7C3" fontSize="xs">
          {item.label}
        </Text>
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
      backgroundColor={background}
      transition="0.4s"
      _hover={{ boxShadow: '0 23px 66px 4px rgba(176, 183, 195, 0.25)', cursor: 'pointer' }}
      as={Link}
      to={`/myovens/${oven.ovenId}`}
    >
      <Flex direction="column" w="70%">
        <Flex mb={4} mr={16} justifyContent="space-between">
          {renderItems()}
        </Flex>
        <ProgressPill value={74} />
      </Flex>
      <Flex alignItems="center">
        <Button variant="outline" rightIcon={<MdChevronRight />} w="200px">
          Manage Oven
        </Button>
      </Flex>
    </Flex>
  );
};

export default MyOvenCard;
