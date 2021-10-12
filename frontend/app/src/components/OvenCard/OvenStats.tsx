import {
  Center,
  Divider,
  Flex,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useOvenStats } from '../../hooks/utilHooks';
import ProgressPill from './ProgressPill';
import { Oven } from '../../interfaces';

const OvenStats: React.FC<{ oven: Oven | undefined }> = ({ oven }) => {
  const { stats } = useOvenStats({ type: 'MyOvens', oven });
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const text4color = useColorModeValue('text4', 'white');

  return (
    <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
      <div>
        <Text color={textcolor} fontWeight="600">
          Oven Stats
        </Text>

        {oven?.address == null ? (
          <SkeletonText mt={2} noOfLines={1} w="300px" />
        ) : (
          <Text color={text4color} as="span" fontSize="sm">
            {oven?.address}
          </Text>
        )}
      </div>

      <Divider />

      <Flex w="100%">
        <Stack w="30%" alignItems="center">
          {stats?.collateralRatio == null ? (
            <Skeleton>0000</Skeleton>
          ) : (
            <Text fontSize="lg" fontWeight="600">
              {stats?.collateralRatio ?? '0000'}%
            </Text>
          )}

          <Text color={text4color} fontSize="xs">
            Collateral ratio
          </Text>
        </Stack>

        <Center height="48px" mx={6}>
          <Divider orientation="vertical" />
        </Center>

        <Stack w="70%" textAlign="right">
          <Skeleton isLoaded={stats?.collateralUtilization != null}>
            <ProgressPill value={Number(stats?.collateralUtilization)} />
          </Skeleton>
          <Text color={text4color} fontSize="xs">
            Collateral utilization
          </Text>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default OvenStats;
