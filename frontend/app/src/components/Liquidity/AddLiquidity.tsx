import { Button, Flex, FormControl, FormLabel, Icon, Input, Stack, Text } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';

const AddLiquidity: React.FC = () => {
  return (
    <Stack spacing={2}>
      <Text>Add liquidity</Text>

      <Flex alignItems="center" justifyContent="space-between">
        <FormControl id="to-input-amount" mt={-2} mb={6} w="45%">
          <FormLabel fontSize="xs">tez to deposit</FormLabel>
          <Input type="number" />
        </FormControl>

        <Icon as={MdAdd} />
        <FormControl id="to-input-amount" mt={-2} mb={6} w="45%">
          <FormLabel fontSize="xs">ctez to deposit(approx)</FormLabel>
          <Input readOnly border={0} placeholder="0.0" type="number" />
        </FormControl>
      </Flex>

      <Button variant="outline">Enter an amount</Button>
    </Stack>
  );
};

export default AddLiquidity;
