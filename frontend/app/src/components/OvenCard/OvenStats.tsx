import {
  Box,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { useOvenStats } from '../../hooks/utilHooks';
import ProgressPill from './ProgressPill';

const OvenStats: React.FC = () => {
  const { oven } = useOvenStats();
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const text4color = useColorModeValue('text4', 'white');

  return (
    <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
      <div>
        <Text color={textcolor} fontWeight="600">
          Oven Stats
        </Text>

        <Text color={text4color} as="span" fontSize="sm">
          {oven?.address}
        </Text>
      </div>

      <Divider />

      <Flex w="100%">
        <Stack w="30%" alignItems="center">
          <Text fontSize="lg" fontWeight="600">
            300%
          </Text>
          <Text color={text4color} fontSize="xs">
            Collateral ratio
          </Text>
        </Stack>

        <Center height="48px" mx={6}>
          <Divider orientation="vertical" />
        </Center>

        <Stack w="70%" textAlign="right">
          <ProgressPill value={75} />
          <Text color={text4color} fontSize="xs">
            Collateral utilization
          </Text>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default OvenStats;
