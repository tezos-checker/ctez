import { Flex, Text, Icon, Stack, Divider } from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity';

const Liquidity: React.FC = () => {
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

      <Flex alignItems="center" direction="row">
        <Divider />

        <Text ml={4} mr={4}>
          OR
        </Text>

        <Divider />
      </Flex>

      <RemoveLiquidity />
    </Stack>
  );
};

export { Liquidity };
