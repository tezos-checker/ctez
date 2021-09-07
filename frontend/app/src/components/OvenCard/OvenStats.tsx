import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useMemo } from 'react';

const OvenStats: React.FC = () => {
  const stats = useMemo(
    () => [
      {
        label: 'Outstanding Ctez',
        value: '36.3k',
        percentage: 67,
      },
      {
        label: 'Max Mintable Ctez',
        value: '64.1k',
        percentage: 84,
      },
      {
        label: 'Remaining Ctez',
        value: '42.4k',
        percentage: 46,
      },
    ],
    [],
  );

  return (
    <Stack p={8} spacing={4} backgroundColor="white" borderRadius={16}>
      <Text>Ctez Stats</Text>

      <Divider />

      <Flex justifyContent="space-between">
        {stats.map(({ label, value, percentage }) => (
          <Box key={label} textAlign="center">
            <CircularProgress value={percentage} size="80px" thickness={8} capIsRound>
              <CircularProgressLabel>{percentage}%</CircularProgressLabel>
            </CircularProgress>

            <Text fontSize="lg">{value}</Text>
            <Text fontSize="xs">{label}</Text>
          </Box>
        ))}
      </Flex>
    </Stack>
  );
};

export default OvenStats;
