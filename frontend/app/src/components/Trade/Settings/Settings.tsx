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
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MdInfo } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { setSlippage, setDeadline } from '../../../redux/slices/TradeSlice';
import data from '../../../assets/data/info.json';
import { useThemeColors } from '../../../hooks/utilHooks';

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
  const [text2, inputbg, cardbg, text4] = useThemeColors([
    'text2',
    'inputbg',
    'tooltipbg1',
    'text4',
  ]);

  const showInfoMaxSlippage = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color={text4} as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'max slippage')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg, text4]);

  const showInfoTimeout = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color={text4} as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'timeout')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg, text4]);

  return (
    <form autoComplete="off" onBlur={setLocalValuesToStore}>
      <Heading as="h4" size="md" color={text2}>
        Transaction settings
      </Heading>
      <FormControl id="from-input-amount">
        <FormLabel color={text2} fontSize="xs" mt={6} mb={3}>
          Max slippage %
          <Tooltip
            label={showInfoMaxSlippage}
            placement="right-start"
            borderRadius={14}
            backgroundColor={cardbg}
          >
            <span>
              <Icon opacity="0.3" fontSize="md" color={text4} as={MdInfo} m={1} mb={1} />
            </span>
          </Tooltip>
        </FormLabel>
        <InputGroup>
          <NumberInput
            color={text2}
            bg={inputbg}
            max={100}
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
        <FormLabel color={text2} fontSize="xs" mt={6} mb={3}>
          Transaction Timeout
          <Tooltip
            label={showInfoTimeout}
            placement="right-start"
            borderRadius={14}
            backgroundColor={cardbg}
          >
            <span>
              <Icon opacity="0.3" fontSize="md" color={text4} as={MdInfo} m={1} mb={1} />
            </span>
          </Tooltip>
        </FormLabel>
        <InputGroup>
          <NumberInput
            color={text2}
            bg={inputbg}
            max={32}
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
      </FormControl>
    </form>
  );
};
export { Settings };
