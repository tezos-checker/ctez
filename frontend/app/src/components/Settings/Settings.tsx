import {
  FormControl,
  FormLabel,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setSlippage, setDeadline } from '../../redux/slices/TradeSlice';

const Settings: React.FC = () => {
  const { slippage, deadline } = useAppSelector((state) => state.trade);
  const [slippageLocal, setSlippageLocal] = useState('0.2');
  const [deadlineLocal, setDeadlineLocal] = useState('20');

  const dispatch = useAppDispatch();

  // ? Setting values to store on form blur
  const setLocalValuesToStore = useCallback(() => {
    dispatch(setSlippage(Number(slippageLocal)));
    dispatch(setDeadline(Number(deadlineLocal)));
  }, [slippageLocal, deadlineLocal, dispatch]);

  useEffect(() => {
    // ? Setting local values from store on Mount
    setSlippageLocal(`${slippage}`);
    setDeadlineLocal(`${deadline}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <form autoComplete="off" onBlur={setLocalValuesToStore}>
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
            value={slippageLocal}
            onChange={(ev) => setSlippageLocal(ev)}
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
            value={deadlineLocal}
            mb={5}
            onChange={(ev) => setDeadlineLocal(ev)}
          >
            {getRightElement('Minutes')}
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper bg={inputbg} />
              <NumberDecrementStepper bg={inputbg} />
            </NumberInputStepper>
          </NumberInput>
        </InputGroup>
        <button type="button" onClick={setLocalValuesToStore}>
          Update
        </button>
      </FormControl>
    </form>
  );
};
export { Settings };
