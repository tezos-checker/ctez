import { Flex, Text, Icon, Stack, Box, Collapse, Button, useDisclosure } from '@chakra-ui/react';
import { FaChevronCircleDown } from 'react-icons/fa';
import { MdInfo } from 'react-icons/md';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity';

const Liquidity: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={6}>
      <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor="gray.50">
        <Icon fontSize="2xl" as={MdInfo} m={1} />
        <Text fontSize="xs" ml={2}>
          By adding liquidity you'll earn 0.2% of all trades on this pair proportional to your share
          of the pool.
        </Text>
      </Flex>

      <AddLiquidity />

      <Button
        onClick={onToggle}
        rightIcon={
          <FaChevronCircleDown
            style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: '0.3s' }}
          />
        }
      >
        Remove Liquidity
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <Box>
          <RemoveLiquidity />
        </Box>
      </Collapse>
    </Stack>
  );
};

export { Liquidity };
