import { Divider, Flex, Stack, Text, useColorModeValue, Wrap, WrapItem } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import ProgressPill from './ProgressPill';
import { useOvenStats } from '../../hooks/utilHooks';
import Button from '../button/Button';
import Delegate from '../modals/Delegate';
import { useOvenStorage } from '../../api/queries';
import { trimAddress } from '../../utils/addressUtils';
import ChangeDepositor from '../modals/ChangeDepositor';

const OvenInfo: React.FC = () => {
  const { oven } = useOvenStats();
  const background = useColorModeValue('white', 'cardbgdark');
  const [delegateOpen, setDelegateOpen] = useState<boolean>(false);
  const [changeDepositorOpen, setChangeDepositorOpen] = useState<boolean>(false);

  const { data: ovenStorageData } = useOvenStorage(oven?.address);

  const canAnyoneDeposit = useMemo(
    () =>
      !!(
        ovenStorageData &&
        !Array.isArray(ovenStorageData.depositors) &&
        Object.keys(ovenStorageData.depositors).includes('any')
      ),
    [ovenStorageData],
  );

  const modals = useMemo(() => {
    if (!oven) {
      return null;
    }

    return (
      <>
        <Delegate isOpen={delegateOpen} onClose={() => setDelegateOpen(false)} oven={oven} />
        <ChangeDepositor
          isOpen={changeDepositorOpen}
          onClose={() => setChangeDepositorOpen(false)}
          oven={oven}
          ovenStorage={ovenStorageData}
          canAnyoneDeposit={canAnyoneDeposit}
        />
      </>
    );
  }, [canAnyoneDeposit, changeDepositorOpen, delegateOpen, oven, ovenStorageData]);

  return (
    <>
      <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
        <Flex w="100%" justifyContent="space-between">
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              15.5
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Liquidation Price
            </Text>
          </Stack>
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              15.5
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Collateralization Ratio
            </Text>
          </Stack>
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              15.5
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Current target
            </Text>
          </Stack>
        </Flex>

        <Divider />

        <Flex w="100%" justifyContent="space-between" alignItems="center">
          <Text fontSize="12px" pr="10">
            <strong>CBaker:</strong>
            <span>{oven?.baker}</span>
          </Text>

          <Button variant="outline" w="100%" onClick={() => setDelegateOpen(true)}>
            Change
          </Button>
        </Flex>

        <div>
          <ProgressPill value={75} />

          <Flex justifyContent="space-between" mx={2}>
            <Text color="#B0B7C3" fontSize="xs">
              Oven Balance - 05
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Outstanding Ctez - 05
            </Text>
          </Flex>
        </div>

        <div>
          <Text color="#4E5D78" fontWeight="600" mb={2}>
            {!canAnyoneDeposit ? 'Whitelisted Addresses' : 'Currently Anyone can deposit'}
          </Text>

          {!canAnyoneDeposit && (
            <Wrap mb={2}>
              {(ovenStorageData?.depositors as string[])?.map((dep) => (
                <WrapItem key={dep} border="1px" borderColor="gray.100" borderRadius={16} px={2}>
                  {trimAddress(dep)}
                </WrapItem>
              ))}
            </Wrap>
          )}

          <Button w={180} variant="outline" onClick={() => setChangeDepositorOpen(true)}>
            Change
          </Button>
        </div>
      </Stack>
      {modals}
    </>
  );
};

export default OvenInfo;
