import {
  Box,
  Divider,
  Flex,
  Select,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDelegates, useOvenDelegate } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';
import Button from '../button/Button';
import { cTezError, delegate } from '../../contracts/ctez';
import Identicon from '../avatar/Identicon';
import { AllOvenDatum } from '../../interfaces';
import SkeletonLayout from '../skeleton';

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
      </Text>

      <Divider />

      {edit ? editBakerCard : bakerCard}
    </Stack>
  );
};

export default BakerInfo;
