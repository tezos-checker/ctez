import {
  Box,
  Divider,
  Flex,
  Icon,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { components, GroupBase, OptionProps, OptionsOrGroups } from 'react-select';
import { validateAddress } from '@taquito/utils';
import { useDelegates, useOvenDelegate } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';
import Button from '../button/Button';
import { cTezError, delegate } from '../../contracts/ctez';
import Identicon from '../avatar/Identicon';
import { AllOvenDatum } from '../../interfaces';
import SkeletonLayout from '../skeleton';
import data from '../../assets/data/info.json';
import { useTxLoader } from '../../hooks/utilHooks';
import CopyAddress from '../CopyAddress/CopyAddress';

type TOption = { label: string; value: string };

const BakerInfo: React.FC<{ oven: AllOvenDatum | null }> = ({ oven }) => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);
  const { data: baker, refetch: refetchBaker } = useOvenDelegate(oven?.value.address);

  const toast = useToast();

  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');

  const createOption = useCallback<(label: string) => TOption>(
    (label) => ({
      label,
      value: label,
    }),
    [],
  );

  const [bakerSelect, setBakerSelect] = useState<TOption | null>(null);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [edit, setEdit] = useState(false);
  const cardbg = useColorModeValue('bg4', 'darkblue');
  const handleProcessing = useTxLoader();

  const [options, setOptions] = useState<OptionsOrGroups<TOption, GroupBase<TOption>>>([]);

  useEffect(() => {
    setOptions(delegates?.map((x) => createOption(x.address)) ?? []);
  }, [createOption, delegates]);

  const handleCreate = useCallback(
    (e: string) => {
      const newOption = createOption(e);
      setOptions((prev) => [...prev, newOption]);
    },
    [createOption],
  );

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

  const handleConfirm = useCallback(async () => {
    setLoading(true);

    if (!bakerSelect) {
      return;
    }

    try {
      const result = await delegate(oven?.value.address ?? '', bakerSelect.value);

      setProcessing(true);

      handleProcessing(result).then((res) => {
        if (res) {
          refetchBaker().finally(() => setProcessing(false));
        } else {
          setProcessing(false);
        }
      });
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
  }, [bakerSelect, handleProcessing, oven?.value.address, refetchBaker, t, toast]);

  const isInputValid = useCallback(
    (inputValue: string) => {
      const exists =
        options?.find((option) => (option as TOption).value === inputValue) !== undefined;
      const valid = validateAddress(inputValue) === 3;
      // TODO: show validation errors somewhere?
      return valid && !exists;
    },
    [options],
  );

  const bakerCard = useMemo(() => {
    if (baker) {
      // ? Show updated baker (less opacity) when user edits and submits it, to avoid confusing the user
      const bakerToDisplay =
        (loading || processing) && bakerSelect?.value ? bakerSelect.value : baker;

      return (
        <Flex
          w="100%"
          boxShadow="lg"
          px={3}
          py={1}
          borderRadius={6}
          opacity={loading || processing ? 0.3 : 1}
        >
          <Identicon seed={bakerToDisplay ?? undefined} type="tzKtCat" avatarSize="sm" />

          <Text as="span" my="auto" flexGrow={1} mx={2}>
            <CopyAddress address={bakerToDisplay}>{bakerToDisplay}</CopyAddress>
          </Text>
          <Button variant="ghost" size="sm" onClick={() => setEdit(true)} disabled={processing}>
            Edit
          </Button>
        </Flex>
      );
    }

    return <SkeletonLayout count={1} component="AddressCard" />;
  }, [baker, bakerSelect?.value, loading, processing]);

  const Option = (props: OptionProps<TOption>) => {
    const address = props.data.value;
    return (
      <CopyAddress address={address}>
        <components.Option {...props} />
      </CopyAddress>
    );
  };

  const editBakerCard = useMemo(() => {
    if (edit) {
      return (
        <form>
          <CreatableSelect
            isClearable
            placeholder="Add a baker or Select from the list below"
            onChange={(ev) => {
              if (ev) {
                setBakerSelect(ev as TOption);
              }
            }}
            options={options}
            isValidNewOption={isInputValid}
            onCreateOption={handleCreate}
            value={bakerSelect}
            components={{ Option }}
            id="bakerValue"
          />

          <Flex mt={5} justifyContent="right">
            <Button variant="outline" onClick={() => setEdit(false)}>
              Cancel
            </Button>
            <Box w={2} />
            <Button onClick={handleConfirm} isLoading={loading}>
              Confirm
            </Button>
          </Flex>
        </form>
      );
    }

    return null;
  }, [edit, options, isInputValid, handleCreate, bakerSelect, handleConfirm, loading]);

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
