import { Box, Stack, Text } from '@chakra-ui/react';

interface IProgressPill {
  value: number;
}

const ProgressPill: React.FC<IProgressPill> = ({ value }) => {
  return (
    <Stack direction="row" backgroundColor="green.100" borderRadius={16} px={4}>
      <Box h={2} borderRadius={4} w="100%" my="auto" backgroundColor="white">
        <Box h="100%" w={`${value}%`} borderRadius={4} backgroundColor="green.300" />
      </Box>
      <Text maxWidth={40}>{value}%</Text>
    </Stack>
  );
};

export default ProgressPill;
