import { Box, Checkbox, Flex, useColorModeValue, useRadio } from '@chakra-ui/react';
import { UseRadioProps } from '@chakra-ui/radio/dist/types/use-radio';

const RadioCard: React.FC<UseRadioProps> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();
  const text2 = useColorModeValue('text2', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const bordercolor = useColorModeValue('violet', '');

  return (
    <Box as="label" w="45%">
      <input {...input} />
      <Flex
        justifyContent="space-between"
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        color={text2}
        bg={inputbg}
        borderColor={bordercolor}
        boxShadow="md"
        _checked={{
          bgGradient: 'linear(90.5deg, #0F62FF 8.62%, #6B5BD2 102.96%)',
          color: 'white',
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
