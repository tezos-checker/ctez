import { Button, Flex, FormControl, FormLabel, Icon, Input, Stack, Text } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';

const RemoveLiquidity: React.FC = () => {
  return (
    <Stack spacing={2}>
      <Text>Remove liquidity</Text>

      <FormControl id="to-input-amount" mb={6}>
        <FormLabel fontSize="xs">LQT to burn</FormLabel>
        <Input type="number" />
      </FormControl>

      <Flex alignItems="center" justifyContent="space-between">
        <FormControl id="to-input-amount" mb={6} w="45%">
          <FormLabel fontSize="xs">Min. tez to withdraw</FormLabel>
          <Input readOnly border={0} placeholder="0.0" type="number" />
        </FormControl>

        <Icon as={MdAdd} />
        <FormControl id="to-input-amount" mb={6} w="45%">
          <FormLabel fontSize="xs">Min. ctez to withdraw</FormLabel>
          <Input readOnly border={0} placeholder="0.0" type="number" />
        </FormControl>
      </Flex>
      <Button variant="outline">Enter an amount</Button>
    </Stack>
  );
};

export default RemoveLiquidity;
