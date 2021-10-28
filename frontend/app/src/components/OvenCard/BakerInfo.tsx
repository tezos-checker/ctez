import { Box, Divider, Flex, Icon, Spacer, Stack, Text, Tooltip, useToast } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useMemo, useState } from 'react';
import { components, OptionProps } from 'react-select';
import { validateAddress } from '@taquito/utils';
import { useDelegates, useOvenDelegate } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';
import Button from '../button/Button';
import { cTezError, delegate } from '../../contracts/ctez';
import Identicon from '../avatar/Identicon';
import { AllOvenDatum } from '../../interfaces';
import SkeletonLayout from '../skeleton';
import data from '../../assets/data/info.json';
import { useBakerSelect, useThemeColors, useTxLoader } from '../../hooks/utilHooks';
import CopyAddress from '../CopyAddress/CopyAddress';

type TOption = { label: string; value: string };

const BakerInfo: React.FC<{ oven: AllOvenDatum | null }> = ({ oven }) => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);
  const { data: baker, refetch: refetchBaker } = useOvenDelegate(oven?.value.address);

  const toast = useToast();
  const { bakerSelect, setBakerSelect, options, handleBakerCreate } = useBakerSelect(delegates);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [edit, setEdit] = useState(false);
  const [background, textcolor, cardbg, text4Text4] = useThemeColors([
    'cardbg',
    'textColor',
    'tooltipbg1',
    'text4',
  ]);
  const handleProcessing = useTxLoader();

  const showInfo = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color={text4Text4} as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'baker')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg, text4Text4]);

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
          {!oven?.isImported && (
            <Button variant="ghost" size="sm" onClick={() => setEdit(true)} disabled={processing}>
              Edit
            </Button>
          )}
        </Flex>
      );
    }

    return <SkeletonLayout count={1} component="AddressCard" />;
  }, [baker, bakerSelect?.value, loading, oven?.isImported, processing]);

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
            onCreateOption={handleBakerCreate}
            value={bakerSelect}
            components={{ Option }}
            id="bakerValue"
          />

          <Flex mt={5}>
            <Spacer />
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
  }, [
    edit,
    options,
    isInputValid,
    handleBakerCreate,
    bakerSelect,
    handleConfirm,
    loading,
    setBakerSelect,
  ]);

  return (
    <Stack p={8} spacing={4} borderRadius={16} backgroundColor={background}>
      <Text color={textcolor} fontWeight="600">
        Baker
        <Tooltip label={showInfo} placement="right" borderRadius={14} backgroundColor={cardbg}>
          <span>
            <Icon opacity="0.3" fontSize="lg" color={text4Text4} as={MdInfo} m={1} mb={1} />
          </span>
        </Tooltip>
      </Text>

      <Divider />

      {edit ? editBakerCard : bakerCard}
    </Stack>
  );
};

export default BakerInfo;
