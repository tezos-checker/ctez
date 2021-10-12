import { Divider, Flex, Stack, Tag, Text, useColorModeValue } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { useOvenStorage } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';
import Button from '../button/Button';
import Identicon from '../avatar/Identicon';
import ChangeDepositor from '../modals/ChangeDepositor';
import { Oven } from '../../interfaces';
import SkeletonLayout from '../skeleton';

const DepositorsInfo: React.FC<{ oven: Oven | undefined }> = ({ oven }) => {
  const [{ pkh: userAddress }] = useWallet();

  const { data: ovenStorageData } = useOvenStorage(oven?.address);

  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');

  const [edit, setEdit] = useState(false);

  const { depositors, canAnyoneDeposit, isLoading } = useMemo(() => {
    if (!oven || !ovenStorageData || !userAddress) {
      return { depositors: [], canAnyoneDeposit: false, isLoading: true };
    }

    return {
      canAnyoneDeposit:
        ovenStorageData &&
        !Array.isArray(ovenStorageData.depositors) &&
        Object.keys(ovenStorageData.depositors).includes('any'),
      depositors: [
        {
          value: userAddress,
          label: 'You',
        },
        ...(ovenStorageData?.depositors as string[])?.map((dep) => ({
          value: dep,
          label: dep === oven?.baker ? 'Baker' : null,
        })),
      ],
      isLoading: false,
    };
  }, [oven, ovenStorageData, userAddress]);

  const content = useMemo(() => {
    if (isLoading) {
      return <SkeletonLayout component="AddressCard" count={3} />;
    }

    if (canAnyoneDeposit) {
      return <Text>Currently Anyone can deposit</Text>;
    }

    return depositors.map((dep) => (
      <Flex key={dep.value} w="100%" boxShadow="lg" px={3} py={1} borderRadius={6}>
        <Identicon seed={dep.value ?? undefined} type="tzKtCat" avatarSize="sm" />
        <Text as="span" my="auto" flexGrow={1} mx={2}>
          {dep.value}
        </Text>
        {dep.label && (
          <Tag size="sm" borderRadius="full" variant="solid" h={4} my="auto">
            {dep.label}
          </Tag>
        )}
      </Flex>
    ));
  }, [canAnyoneDeposit, depositors, isLoading]);

  return (
    <>
      <Stack p={8} spacing={4} borderRadius={16} backgroundColor={background}>
        <Text color={textcolor} fontWeight="600">
          Authorized Depositors
        </Text>

        <Divider />

        {content}

        <Button w="100%" variant="outline" leftIcon={<MdEdit />} onClick={() => setEdit(true)}>
          Edit Depositors
        </Button>
      </Stack>

      {oven && (
        <ChangeDepositor
          isOpen={edit}
          onClose={() => setEdit(false)}
          oven={oven}
          ovenStorage={ovenStorageData}
          canAnyoneDeposit={canAnyoneDeposit}
        />
      )}
    </>
  );
};

export default DepositorsInfo;
