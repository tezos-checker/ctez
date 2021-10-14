import { Box, Stack, Text, useColorMode, useColorModeValue } from '@chakra-ui/react';

interface IProgressPill {
  value: number;
}

const ProgressPill: React.FC<IProgressPill> = ({ value }) => {
  const progresspillbg = useColorModeValue('green', 'darkblue');
  return (
    <Stack
      direction="row"
      backgroundColor={value < 99 ? (value > 80 ? '#E5F6EF' : '#F6F5E5') : '#FFE3E2'}
      borderRadius={16}
      px={4}
      w="100%"
    >
      <Box h={2} borderRadius={4} w="100%" my="auto" backgroundColor="white">
        <Box
          h="100%"
          w={`${value}%`}
          borderRadius={4}
          backgroundColor={value < 99 ? (value > 80 ? '#38CB89' : '#F3DD63') : '#CC3936'}
        />
      </Box>
      <Text maxWidth={40}>{value}%</Text>
    </Stack>
  );
};

export default ProgressPill;
