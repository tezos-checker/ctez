import { Button, Flex, FormControl, FormLabel, Icon, Input, Text } from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';

const Deposit: React.FC = () => {
  return (
    <form>
      <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor="gray.50">
        <Icon fontSize="2xl" as={MdInfo} m={1} />
        <Text fontSize="xs" ml={2}>
          By adding liquidity you'll earn 0.2% of all trades on this pair proportional to your share
          of the pool. Fees are added to the
        </Text>
      </Flex>

      <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
        <FormLabel fontSize="xs">Deposit Tezos</FormLabel>
        <Input type="number" />
      </FormControl>

      <Button w="100%" variant="solid">
        Deposit Tezos
      </Button>
    </form>
  );
};

export default Deposit;
