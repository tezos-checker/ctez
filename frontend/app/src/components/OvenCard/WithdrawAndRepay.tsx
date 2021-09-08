import {
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';

const WithdrawAndRepay: React.FC = () => {
  return (
    <Stack spacing={6}>
      <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor="gray.50">
        <Icon fontSize="2xl" as={MdInfo} m={1} />
        <Text fontSize="xs" ml={2}>
          By adding liquidity you'll earn 0.2% of all trades on this pair proportional to your share
          of the pool. Fees are added to the
        </Text>
      </Flex>

      <FormControl id="to-input-amount" mt={-2} mb={6} w="100%">
        <FormLabel fontSize="xs">Withdrawl To</FormLabel>
        <Input type="number" />
      </FormControl>

      <FormControl id="to-input-amount" mt={-2} mb={6} w="100%">
        <FormLabel fontSize="xs">Deposit Tezos</FormLabel>
        <Input type="number" />
      </FormControl>

      <Button w="100%" variant="outline">
        Deposit tez
      </Button>

      <Flex alignItems="center" direction="row">
        <Divider />

        <Text ml={4} mr={4}>
          OR
        </Text>

        <Divider />
      </Flex>

      <FormControl id="to-input-amount" mt={-2} mb={6} w="100%">
        <FormLabel fontSize="xs">Mint Ctez</FormLabel>
        <Input type="number" />
      </FormControl>

      <Button w="100%" variant="solid">
        Mint ctex
      </Button>
    </Stack>
  );
};

export default WithdrawAndRepay;
