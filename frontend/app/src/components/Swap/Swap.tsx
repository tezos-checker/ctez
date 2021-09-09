import { Button, Flex, FormControl, FormLabel, IconButton, Input, Text } from '@chakra-ui/react';
import { MdSwapVert, MdAdd } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useWallet } from '../../wallet/hooks';
import { useCfmmStorage } from '../../api/queries';
import { BUTTON_TXT, TButtonText } from '../../constants/swap';

const Swap: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const history = useHistory();
  const [minBuyValue, setMinBuyValue] = useState(0);
  const [minWithoutSlippage, setWithoutSlippage] = useState(0);
  const [buttonText, setButtonText] = useState<TButtonText>(BUTTON_TXT.ENTER_AMT);
  const { data: cfmmStorage } = useCfmmStorage();

  useEffect(() => {
    console.log(userAddress);
  }, [userAddress]);

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
        {buttonText}
      </Button>
    </form>
  );
};

export { Swap };
