import { Center, Divider, Flex, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useOvenStats } from '../../hooks/utilHooks';
import { useAppDispatch } from '../../redux/store';
import Button from '../button/Button';
import Deposit from '../modals/Deposit';
import Withdraw from '../modals/Withdraw';

const CollateralOverview: React.FC = () => {
  const { stats, oven } = useOvenStats();
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');

  const modals = useMemo(() => {
    if (!oven) {
      return null;
    }

    return (
      <>
        <Deposit isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
        <Withdraw isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
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
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              5 tez
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              tez collateral
            </Text>
          </Stack>
          <Center height="50px">
            <Divider orientation="vertical" />
          </Center>
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              5 tez
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Required tez collateral
            </Text>
          </Stack>
          <Center height="50px">
            <Divider orientation="vertical" />
          </Center>
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              5 tez
            </Text>
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
