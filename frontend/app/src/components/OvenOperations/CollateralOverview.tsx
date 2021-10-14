import {
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useMemo, useState, MouseEvent } from 'react';
import { useOvenStats } from '../../hooks/utilHooks';
import Button from '../button/Button';
import Deposit from '../modals/Deposit';
import Withdraw from '../modals/Withdraw';
import { AllOvenDatum } from '../../interfaces';
import data from '../../assets/data/info.json';

const CollateralOverview: React.FC<{ oven: AllOvenDatum | null }> = ({ oven }) => {
  const { stats } = useOvenStats(oven);
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const cardbg = useColorModeValue('bg4', 'darkblue');

  const content = data.map((item) => {
    if (item.topic === 'oven stats') {
      return item.content;
    }
    return null;
  });

  const showInfo = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {content}
          </Text>
        </Flex>
      </div>
    );
  }, [content]);

  const modals = useMemo(() => {
    if (!oven) {
      return null;
    }

    return (
      <>
        <Deposit oven={oven} isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
        <Withdraw oven={oven} isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
      </>
    );
  }, [oven, depositOpen, setDepositOpen, withdrawOpen, setWithdrawOpen]);

  return (
    <>
      <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
        <Text color={textcolor} fontWeight="700">
          Collateral Overview
        </Text>

        <Divider />

        <Flex w="100%" justifyContent="space-between">
          <Stack>
            <Skeleton isLoaded={stats?.ovenBalance != null}>
              <Text color="4E5D78" fontWeight="600" fontSize="lg">
                {stats?.ovenBalance.toFixed(2)} tez
              </Text>
            </Skeleton>

            <Text color="#B0B7C3" fontSize="xs">
              tez collateral
              <Tooltip
                label={showInfo}
                placement="right"
                borderRadius={14}
                backgroundColor={cardbg}
              >
                <span>
                  <Icon opacity="0.3" fontSize="md" color="#B0B7C3" as={MdInfo} m={1} mb={1} />
                </span>
              </Tooltip>
            </Text>
          </Stack>

          <Center height="50px">
            <Divider orientation="vertical" />
          </Center>

          <Stack>
            <Skeleton isLoaded={stats?.reqTezBalance != null}>
              <Text color="4E5D78" fontWeight="600" fontSize="lg">
                {stats?.reqTezBalance.toFixed(2)} tez
              </Text>
            </Skeleton>

            <Text color="#B0B7C3" fontSize="xs">
              Required tez collateral
              <Tooltip
                label={showInfo}
                placement="right"
                borderRadius={14}
                backgroundColor={cardbg}
              >
                <span>
                  <Icon opacity="0.3" fontSize="md" color="#B0B7C3" as={MdInfo} m={1} mb={1} />
                </span>
              </Tooltip>
            </Text>
          </Stack>

          <Center height="50px">
            <Divider orientation="vertical" />
          </Center>

          <Stack>
            <Skeleton isLoaded={stats?.withdrawableTez != null}>
              <Text color="4E5D78" fontWeight="600" fontSize="lg">
                {Math.abs(stats?.withdrawableTez ?? 0).toFixed(2)} tez
              </Text>
            </Skeleton>

            <Text color="#B0B7C3" fontSize="xs">
              Withdraw tez
              <Tooltip
                label={showInfo}
                placement="right"
                borderRadius={14}
                backgroundColor={cardbg}
              >
                <span>
                  <Icon opacity="0.3" fontSize="md" color="#B0B7C3" as={MdInfo} m={1} mb={1} />
                </span>
              </Tooltip>
            </Text>
          </Stack>
        </Flex>

        <HStack w="100%" justifyContent="space-between" spacing="24px">
          <Button variant="outline" w="95%" onClick={() => setDepositOpen(true)}>
            Deposit
          </Button>

          <Button variant="outline" w="100%" onClick={() => setWithdrawOpen(true)}>
            Withdraw
          </Button>
        </HStack>
      </Stack>

      {modals}
    </>
  );
};

export default CollateralOverview;
