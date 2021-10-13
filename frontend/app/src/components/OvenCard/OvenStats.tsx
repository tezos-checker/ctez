import {
  Center,
  Divider,
  Flex,
  Icon,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMemo, useState, MouseEvent } from 'react';
import { MdInfo } from 'react-icons/md';
import { useOvenStats } from '../../hooks/utilHooks';
import ProgressPill from './ProgressPill';
import { Oven } from '../../interfaces';
import Info from '../info/info';
import data from '../../assets/data/info.json';

const OvenStats: React.FC<{ oven: Oven | undefined }> = ({ oven }) => {
  const { stats } = useOvenStats({ type: 'MyOvens', oven });
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const text4color = useColorModeValue('text4', 'white');
  const [showcontent, setShowContent] = useState(false);
  let content: any;

  data.map((item) => {
    if (item.topic === 'oven stats') {
      content = item.content;
    }
    return content;
  });

  const showTooltip = (e: MouseEvent<SVGAElement>) => {
    setShowContent(!showcontent);
  };
  const handleMouseOut = (e: MouseEvent<SVGAElement>) => {
    setShowContent(!showcontent);
  };

  const modals = useMemo(() => {
    return (
      <>
        <Info mt="-45px" ml="92px">
          {content}
        </Info>
      </>
    );
  }, [showcontent, setShowContent]);

  return (
    <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
      <div>
        <Text color={textcolor} fontWeight="600">
          Oven Stats
          <Icon
            opacity="0.3"
            fontSize="lg"
            color="#B0B7C3"
            as={MdInfo}
            m={1}
            mb={1}
            onMouseOver={showTooltip}
            onMouseOut={handleMouseOut}
          />
        </Text>
        {showcontent ? modals : ''}
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
            <Icon
              opacity="0.3"
              fontSize="lg"
              color="#B0B7C3"
              as={MdInfo}
              m={1}
              mb={1}
              onClick={showTooltip}
            />
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
            <Icon opacity="0.3" fontSize="md" color="#B0B7C3" as={MdInfo} m={1} />
          </Text>
        </Stack>
      </Flex>
    </Stack>
  );
};

export default OvenStats;
