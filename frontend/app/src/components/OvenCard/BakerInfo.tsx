import {
  Box,
  Divider,
  Flex,
  Icon,
  Select,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDelegates, useOvenDelegate } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';
import Button from '../button/Button';
import { cTezError, delegate } from '../../contracts/ctez';
import Identicon from '../avatar/Identicon';
import { AllOvenDatum } from '../../interfaces';
import SkeletonLayout from '../skeleton';
import data from '../../assets/data/info.json';

const BakerInfo: React.FC<{ oven: AllOvenDatum | null }> = ({ oven }) => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);
  const { data: baker } = useOvenDelegate(oven?.value.address);

  const toast = useToast();

  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');

  const [delegator, setDelegator] = useState('');
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
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

  useEffect(() => {
    setDelegator(baker ?? '');
  }, [baker, oven]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      const result = await delegate(oven?.value.address ?? '', delegator);
      if (result) {
        toast({
          description: t('txSubmitted'),
          status: 'success',
        });
      }
    } catch (error) {
      const errorText = cTezError[error?.data?.[1].with.int as number] || t('txFailed');
      toast({
        description: errorText,
        status: 'error',
      });
    } finally {
      setLoading(false);
      setEdit(false);
    }
  }, [delegator, oven?.value.address, t, toast]);

  const bakerCard = useMemo(() => {
    if (baker) {
      return (
        <Flex w="100%" boxShadow="lg" px={3} py={1} borderRadius={6}>
          <Identicon seed={baker ?? undefined} type="tzKtCat" avatarSize="sm" />

          <Text as="span" my="auto" flexGrow={1} mx={2}>
            {baker}
          </Text>
          <Button variant="ghost" size="sm" onClick={() => setEdit(true)}>
            Edit
          </Button>
        </Flex>
      );
    }

    return <SkeletonLayout count={1} component="AddressCard" />;
  }, [baker]);

  const editBakerCard = useMemo(() => {
    if (edit) {
      return (
        <>
          <Select
            placeholder={t('delegatePlaceholder')}
            value={delegator}
            onChange={(ev) => {
              setDelegator(ev.target.value);
            }}
            boxShadow="sm"
          >
            {delegates?.map((x) => (
              <option key={x.address} value={x.address}>
                {x.address}
              </option>
            ))}
          </Select>

          <Flex justifyContent="right">
            <Button variant="outline" onClick={() => setEdit(false)}>
              Cancel
            </Button>
            <Box w={2} />
            <Button onClick={handleConfirm} isLoading={loading}>
              Confirm
            </Button>
          </Flex>
        </>
      );
    }

    return null;
  }, [delegates, delegator, edit, handleConfirm, loading, t]);

  return (
    <Stack p={8} spacing={4} borderRadius={16} backgroundColor={background}>
      <Text color={textcolor} fontWeight="600">
        Baker
        <Tooltip label={showInfo} placement="right" borderRadius={14} backgroundColor={cardbg}>
          <span>
            <Icon opacity="0.3" fontSize="lg" color="#B0B7C3" as={MdInfo} m={1} mb={1} />
          </span>
        </Tooltip>
      </Text>

      <Divider />

      {edit ? editBakerCard : bakerCard}
    </Stack>
  );
};

export default BakerInfo;
