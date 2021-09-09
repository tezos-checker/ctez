import { Button, Flex, FormControl, FormLabel, IconButton, Input, Text } from '@chakra-ui/react';
import { MdSwapVert, MdAdd } from 'react-icons/md';

const Swap: React.FC = () => {
  return (
    <form autoComplete="off">
      <FormControl id="from-input-amount">
        <FormLabel fontSize="xs">From</FormLabel>
        <Input type="number" />
      </FormControl>
      <Flex justifyContent="center" mt={2}>
        <IconButton
          variant="ghost"
          size="sm"
          borderRadius="50%"
          aria-label="Swap Token"
          icon={<MdSwapVert />}
        />
      </Flex>

      <FormControl id="to-input-amount" mt={-2} mb={6}>
        <FormLabel fontSize="xs">To (estimate)</FormLabel>
        <Input type="number" />
      </FormControl>

      <Flex justifyContent="space-between">
        <Text fontSize="xs">Rate</Text>
        <Text fontSize="xs">1 XTZ = 1.01 CTEZ</Text>
      </Flex>
      <Flex justifyContent="space-between">
        <Text fontSize="xs">Price Impact</Text>
        <Text fontSize="xs">0.0000%</Text>
      </Flex>

      <Button width="100%" mt={4} p={6} leftIcon={<MdAdd />}>
        Connect wallet
      </Button>
    </form>
  );
};

export { Swap };
