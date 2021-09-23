import { Box, Stack, Text, useColorMode } from '@chakra-ui/react';

interface IProgressPill {
  value: number;
}

const ProgressPill: React.FC<IProgressPill> = ({ value }) => {
  const { colorMode } = useColorMode();
  return (
    <Stack
      direction="row"
      backgroundColor={colorMode === 'light' ? 'green' : 'darkblue'}
      borderRadius={16}
      px={4}
    >
      <Box h={2} borderRadius={4} w="100%" my="auto" backgroundColor="white">
        <Box h="100%" w={`${value}%`} borderRadius={4} backgroundColor="#68D391" />
      </Box>
      <Text maxWidth={40}>{value}%</Text>
    </Stack>
  );
};

export default ProgressPill;
