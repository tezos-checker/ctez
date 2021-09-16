import { Box, Checkbox, Flex, useRadio } from '@chakra-ui/react';
import { UseRadioProps } from '@chakra-ui/radio/dist/types/use-radio';

const RadioCard: React.FC<UseRadioProps> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" w="45%">
      <input {...input} />
      <Flex
        justifyContent="space-between"
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: 'blue.600',
          color: 'white',
          borderColor: 'blue.600',
        }}
        px={5}
        py={3}
      >
        {props.children}
        <Checkbox isChecked={props.isChecked} size="lg" />
      </Flex>
    </Box>
  );
};

export default RadioCard;
