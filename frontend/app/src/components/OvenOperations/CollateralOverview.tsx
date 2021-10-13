import {
  Center,
  Divider,
  Flex,
  HStack,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useOvenStats } from '../../hooks/utilHooks';
import Button from '../button/Button';
import Deposit from '../modals/Deposit';
import Withdraw from '../modals/Withdraw';
import { AllOvenDatum } from '../../interfaces';

const CollateralOverview: React.FC<{ oven: AllOvenDatum | null }> = ({ oven }) => {
  const { stats } = useOvenStats(oven);
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');

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
