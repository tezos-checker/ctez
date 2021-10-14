import { Box, Stack, Text, useColorModeValue } from '@chakra-ui/react';

interface IProgressPill {
  value: number;
}

const ProgressPill: React.FC<IProgressPill> = ({ value }) => {
  const progressPillBg = useColorModeValue('white', 'darkblue');
  return (
    <Stack
      direction="row"
      backgroundColor={value < 99 ? (value > 80 ? '#F6F5E5AA' : '#E5F6EFAA') : '#FFE3E2AA'}
      borderRadius={16}
      px={4}
      w="100%"
    >
      <Box h={2} borderRadius={4} w="100%" my="auto" backgroundColor={progressPillBg}>
        <Box
          h="100%"
          w={`${value}%`}
          borderRadius={4}
          backgroundColor={value < 99 ? (value > 80 ? '#F3DD63' : '#38CB89') : '#CC3936'}
        />
      </Box>
      <Text maxWidth={40}>{value}%</Text>
    </Stack>
  );
};

export default ProgressPill;
