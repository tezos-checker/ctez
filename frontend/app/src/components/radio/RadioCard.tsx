import { Box, Checkbox, Flex, useColorMode, useRadio } from '@chakra-ui/react';
import { UseRadioProps } from '@chakra-ui/radio/dist/types/use-radio';

const RadioCard: React.FC<UseRadioProps> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();
  const { colorMode } = useColorMode();

  return (
    <Box as="label" w="45%">
      <input {...input} />
      <Flex
        justifyContent="space-between"
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        color={colorMode === 'light' ? 'text2' : 'darkheading'}
        bg={colorMode === 'light' ? 'darkheading' : 'textboxbg'}
        borderColor={colorMode === 'light' ? 'violet' : ''}
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
