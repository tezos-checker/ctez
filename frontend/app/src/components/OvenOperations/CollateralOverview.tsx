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
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useCallback, useMemo, useState } from 'react';
import { useOvenStats } from '../../hooks/utilHooks';
import Button from '../button/Button';
import Deposit from '../modals/Deposit';
import Withdraw from '../modals/Withdraw';
import { AllOvenDatum } from '../../interfaces';
import data from '../../assets/data/info.json';
import { formatNumberStandard } from '../../utils/numbers';
import { useOvenStorage } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';

const CollateralOverview: React.FC<{ oven: AllOvenDatum | undefined; isImported: boolean }> = ({
  oven,
}) => {
  const [{ pkh: userAddress }] = useWallet();
  const { stats } = useOvenStats(oven);
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const cardbg = useColorModeValue('bg4', 'darkblue');
  const toast = useToast();
  const { data: ovenStorageData } = useOvenStorage(oven?.value.address);

  const showInfoTez = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'Tez Collateral')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg]);

  const showInfoRequiredTez = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'required tez collateral')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg]);

  const showInfoWithdrawTez = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'Withdraw tez')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg]);

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

  const handleDepositClick = useCallback(() => {
    const canAnyoneDepositLocal =
      ovenStorageData &&
      !Array.isArray(ovenStorageData.depositors) &&
      Object.keys(ovenStorageData.depositors).includes('any');

    const isAuthorized = () => {
      if (canAnyoneDepositLocal) {
        return true;
      }

      if (oven?.key.owner === userAddress) {
        return true;
      }

      if (Array.isArray(ovenStorageData?.depositors)) {
        return ovenStorageData?.depositors.includes(userAddress ?? '');
      }

      return false;
    };

    if (isAuthorized()) {
      setDepositOpen(true);
    } else {
      toast({
        status: 'error',
        description: 'You are not authorized to deposit',
      });
    }
  }, [oven?.key.owner, ovenStorageData, toast, userAddress]);

  const handleWithdrawClick = useCallback(() => {
    const canWithdraw = oven?.key.owner === userAddress;

    const hasWithdrawalAmt = stats?.withdrawableTez ?? 0;

    if (canWithdraw && hasWithdrawalAmt > 0) {
      setWithdrawOpen(true);
    } else {
      toast({
        status: 'error',
        description: !canWithdraw
          ? 'You are not authorized to withdrawal'
          : 'Excessive tez withdrawal',
      });
    }
  }, [oven?.key.owner, stats?.withdrawableTez, toast, userAddress]);

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
                {formatNumberStandard(stats?.ovenBalance)} tez
              </Text>
            </Skeleton>

            <Text color="#B0B7C3" fontSize="xs">
              tez collateral
              <Tooltip
                label={showInfoTez}
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
                {formatNumberStandard(stats?.reqTezBalance)} tez
              </Text>
            </Skeleton>

            <Text color="#B0B7C3" fontSize="xs">
              Required tez collateral
              <Tooltip
                label={showInfoRequiredTez}
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
                {formatNumberStandard(Math.abs(stats?.withdrawableTez ?? 0))} tez
              </Text>
            </Skeleton>

            <Text color="#B0B7C3" fontSize="xs">
              Withdraw tez
              <Tooltip
                label={showInfoWithdrawTez}
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
          <Button variant="outline" w="95%" onClick={handleDepositClick}>
            Deposit
          </Button>

          <Button variant="outline" w="100%" onClick={handleWithdrawClick}>
            Withdraw
          </Button>
        </HStack>
      </Stack>

      {modals}
    </>
  );
};

export default CollateralOverview;
