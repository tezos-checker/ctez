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
import { useOvenStats } from '../../hooks/utilHooks';

const OvenStats: React.FC = () => {
  const { stats: rawStats } = useOvenStats();

  const stats = useMemo(() => {
    if (!rawStats) {
      return [];
    }

    const { outStandingCtez, maxMintableCtez, remainingMintableCtez } = rawStats;
    return [
      {
        label: 'Outstanding Ctez',
        value: outStandingCtez,
        percentage: 67,
      },
      {
        label: 'Max Mintable Ctez',
        value: maxMintableCtez,
        percentage: 84,
      },
      {
        label: 'Remaining Ctez',
        value: remainingMintableCtez,
        percentage: 46,
      },
    ];
  }, [rawStats]);

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
