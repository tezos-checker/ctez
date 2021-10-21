import {
  Center,
  Divider,
  Flex,
  Icon,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { MdInfo } from 'react-icons/md';
import { useOvenStats } from '../../hooks/utilHooks';
import ProgressPill from './ProgressPill';
import { AllOvenDatum } from '../../interfaces';
import data from '../../assets/data/info.json';
import CopyAddress from '../CopyAddress/CopyAddress';

const OvenStats: React.FC<{ oven: AllOvenDatum | null }> = ({ oven }) => {
  const { stats } = useOvenStats(oven);
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const text4color = useColorModeValue('text4', 'white');
  const cardbg = useColorModeValue('bg4', 'darkblue');

  const showInfo = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'oven stats')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg]);

  return (
    <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
      <div>
        <Text color={textcolor} fontWeight="600">
          Oven Stats
          <Tooltip label={showInfo} placement="right" borderRadius={14} backgroundColor={cardbg}>
            <span>
              <Icon opacity="0.3" fontSize="lg" color="#B0B7C3" as={MdInfo} m={1} mb={1} />
            </span>
          </Tooltip>
        </Text>

        {oven?.value.address == null ? (
          <SkeletonText mt={2} noOfLines={1} w="300px" />
        ) : (
          <Text color={text4color} as="span" fontSize="sm">
            <CopyAddress address={oven?.value.address}>{oven?.value.address}</CopyAddress>
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
            <Tooltip label={showInfo} placement="right" borderRadius={14} backgroundColor={cardbg}>
              <span>
                <Icon opacity="0.3" fontSize="md" color="#B0B7C3" as={MdInfo} m={1} mb={1} />
              </span>
            </Tooltip>
          </Text>
        </Stack>

        <Center height="48px" mx={6}>
          <Divider orientation="vertical" />
        </Center>

        <Stack w="70%" textAlign="right">
          <Skeleton isLoaded={stats?.collateralUtilization != null}>
            <ProgressPill value={Number(stats?.collateralUtilization)} oven={null} type={null} />
          </Skeleton>
          <Text color={text4color} fontSize="xs">
            Collateral utilization
            <Tooltip label={showInfo} placement="right" borderRadius={14} backgroundColor={cardbg}>
              <span>
                <Icon opacity="0.3" fontSize="md" color="#B0B7C3" as={MdInfo} m={1} mb={1} />
              </span>
            </Tooltip>
          </Text>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default OvenStats;
