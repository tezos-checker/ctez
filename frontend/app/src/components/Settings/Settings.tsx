import {
  FormControl,
  FormLabel,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputRightAddon,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import { setSlippage, setDeadline } from '../../redux/slices/OvenSlice';

const Settings: React.FC = () => {
  const [slippage, setslippage] = useState('0.2');
  const [deadline, setdeadline] = useState('20');
  const getRightElement = useCallback((value: string) => {
    return (
      <InputRightElement mr={10} backgroundColor="transparent">
        <Text>{value}</Text>
      </InputRightElement>
    );
  }, []);

  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');

  return (
    <form autoComplete="off">
      <Heading as="h4" size="md" color={text2}>
        Transaction settings
      </Heading>
      <FormControl id="from-input-amount">
        <FormLabel color={text2} fontSize="xs" mt={6} mb={3}>
          Max spillage %
        </FormLabel>
        <InputGroup>
          <NumberInput
            color={text4}
            bg={inputbg}
            max={50}
            min={0}
            defaultValue={0.2}
            onChange={(e) => setslippage(e)}
          >
            {getRightElement('%')}
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper bg={inputbg} />
              <NumberDecrementStepper bg={inputbg} />
            </NumberInputStepper>
          </NumberInput>
        </InputGroup>
        <FormLabel color={text2} fontSize="md" mt={6} mb={3}>
          Min ctez bought (approx.): 0
        </FormLabel>
        <FormLabel color={text2} fontSize="xs" mt={6} mb={3}>
          Transaction Timeout
        </FormLabel>
        <InputGroup>
          <NumberInput
            color={text4}
            bg={inputbg}
            max={50}
            min={0}
            defaultValue={20}
            mb={5}
            onChange={(e) => setdeadline(e)}
          >
            {getRightElement('Minutes')}
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper bg={inputbg} />
              <NumberDecrementStepper bg={inputbg} />
            </NumberInputStepper>
          </NumberInput>
        </InputGroup>
      </FormControl>
    </form>
  );
};
export { Settings };
