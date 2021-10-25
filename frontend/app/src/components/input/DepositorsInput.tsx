import {
  Box,
  BoxProps,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  SlideFade,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';
import { trimAddress } from '../../utils/addressUtils';

interface IDepositorItem {
  value: string;
  label: string;
  noDelete?: boolean;
}

interface IDepositorsInputProps {
  outerBoxProps?: BoxProps;
  depositors: IDepositorItem[];
  onChange: (depositors: IDepositorItem[]) => void;
}

const DepositorsInput: React.FC<IDepositorsInputProps> = (props) => {
  const [depositorInput, setDepositorInput] = useState('');
  const text2 = useColorModeValue('text2', 'darkheading');
  const [error, setError] = useState<string | null>(null);

  // const handleDepositorInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = ev.target;
  //   const depositors = value.split(' ');
  //   if (depositors.length > 1 && !props.depositors.some((x) => x.value === depositors[0])) {
  //     props.onChange([
  //       ...props.depositors,
  //       { label: trimAddress(depositors[0]), value: depositors[0] },
  //     ]);
  //     setDepositorInput(depositors[1]);
  //   } else {
  //     setDepositorInput(depositors[0]);
  //   }
  // };

  const onSubmitDepositorInput = () => {
    const addressValid = depositorInput.match(/^(tz1|tz2)([A-Za-z0-9]{33})$/);
    const addressExists = props.depositors.some((x) => x.value === depositorInput);

    if (!addressValid) {
      setError('Invalid Address');
      return;
    }

    if (addressExists) {
      setError('Address already exists');
      return;
    }

    setError(null);
    props.onChange([
      ...props.depositors,
      { label: trimAddress(depositorInput), value: depositorInput },
    ]);
    setDepositorInput('');
  };

  const removeDepositor = (index: number) => {
    props.onChange([...props.depositors.slice(0, index), ...props.depositors.slice(index + 1)]);
  };

  const handleDepositorClick = (depositor: IDepositorItem, index: number) => {
    setDepositorInput(depositor.value);
    props.onChange([...props.depositors.slice(0, index), ...props.depositors.slice(index + 1)]);
  };

  return (
    <Box {...props.outerBoxProps}>
      <FormControl isInvalid={error != null}>
        <FormLabel color={text2} fontSize="xs" fontWeight="500">
          Authorized Depositors
        </FormLabel>

        <Wrap mb={2}>
          {props.depositors.map((dep, idx) => (
            <WrapItem key={dep.value}>
              <SlideFade in reverse>
                <Flex border="1px" borderColor="gray.100" borderRadius={16}>
                  <Text
                    px={2}
                    onClick={dep.noDelete ? undefined : () => handleDepositorClick(dep, idx)}
                    cursor={dep.noDelete ? '' : 'pointer'}
                  >
                    {dep.label}
                  </Text>
                  {!dep.noDelete && (
                    <IconButton
                      aria-label="remove depositor"
                      variant="ghost"
                      isRound
                      size="xs"
                      onClick={() => removeDepositor(idx)}
                      icon={<IoMdCloseCircle />}
                    />
                  )}
                </Flex>
              </SlideFade>
            </WrapItem>
          ))}
        </Wrap>

        <Input
          name="depositorInput"
          id="depositorInput"
          value={depositorInput}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmitDepositorInput();
            }
          }}
          onBlur={() => {
            if (error != null) {
              setError(null);
            }
          }}
          onChange={(event) => setDepositorInput(event.target.value)}
        />
        {!error && (
          <FormHelperText fontSize="xs" color="#4E5D78">
            Press Enter to whitelist depositor before Confirm
          </FormHelperText>
        )}
        {error && <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>}
      </FormControl>
    </Box>
  );
};

export default DepositorsInput;
