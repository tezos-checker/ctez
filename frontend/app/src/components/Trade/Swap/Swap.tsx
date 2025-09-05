import {
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  Text,
  useToast,
} from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { MdSwapVert } from 'react-icons/md';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { addMinutes } from 'date-fns/fp';
import * as Yup from 'yup';
import { useWallet } from '../../../wallet/hooks';
import { useActualCtezStorage, useCtezBaseStats, useUserBalance } from '../../../api/queries';
import {
  BUTTON_TXT,
  ConversionFormParams,
  FORM_TYPE,
  TFormType,
  TOKEN,
} from '../../../constants/swap';
import { tezToCtez, ctezToTez,calcSelfTokensToSell } from '../../../contracts/ctez';
import { logger } from '../../../utils/logger';
import { useAppSelector } from '../../../redux/store';
import Button from '../../button';
import { useThemeColors, useTxLoader } from '../../../hooks/utilHooks';
import { formatNumberStandard, inputFormatNumberStandard } from '../../../utils/numbers';
import TokenInputIcon from '../TokenInputIcon';

const Swap: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [minBuyValue, setMinBuyValue] = useState(0);
  const [formType, setFormType] = useState<TFormType>(FORM_TYPE.TEZ_CTEZ);
  const { data: ctezStorage } = useActualCtezStorage();

  const { data: balance } = useUserBalance(userAddress);
  const { t } = useTranslation(['common', 'header']);
  const toast = useToast();
  const { data: baseStats } = useCtezBaseStats();
  const [text2, inputbg, text4, maxColor] = useThemeColors([
    'text2',
    'inputbg',
    'text4',
    'maxColor',
  ]);
  const handleProcessing = useTxLoader();

  const { slippage, deadline: deadlineFromStore } = useAppSelector((state) => state.trade);
  const [received, setReceived] = useState(0);
  const [minReceived, setMinReceived] = useState(0);
  const [priceImpact, setPriceImpact] = useState(0);

  const initialValues = useMemo<ConversionFormParams>(
    () => ({
      slippage: Number(slippage),
      deadline: Number(deadlineFromStore),
      amount: '',
    }),
    [deadlineFromStore, slippage],
  );

  const maxValue = (): number =>
    formType === FORM_TYPE.CTEZ_TEZ ? balance?.ctez || 0.0 : balance?.xtz || 0.0;

  const rate = (): number => {
    return formType === FORM_TYPE.CTEZ_TEZ
      ? formatNumberStandard(baseStats?.currentCtezBuyPrice ?? 1)
      : formatNumberStandard(baseStats?.currentTezBuyPrice ?? 1);
  }

  const getDexLiquidity = useCallback((): number => {
    const dex = formType === FORM_TYPE.CTEZ_TEZ
      ? ctezStorage?.sell_tez
      : ctezStorage?.sell_ctez;

    return (dex?.self_reserves.toNumber() || 0) / 1e6
  }, [formType, ctezStorage]);

  const validationSchema = Yup.object().shape({
    slippage: Yup.number().min(0).optional(),
    deadline: Yup.number().min(0).required(t('required')),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .positive(t('shouldPositive'))
      .min(0.000001, `${t('shouldMinimum')} 0.000001`)
      .max(maxValue(), `${t('insufficientBalance')}`)
      .required(t('required')),
  });

  const { values, handleChange, handleSubmit, isSubmitting, errors, ...formik } = useFormik({
    onSubmit: async (formData) => {
      try {
        if (!userAddress || !formData.amount) {
          return;
        }
        const deadline = addMinutes(deadlineFromStore)(new Date());
        const result =
          formType === FORM_TYPE.TEZ_CTEZ
            ? await tezToCtez({
              tezSold: formData.amount,
              deadline,
              minCtezBought: minReceived,
              to: userAddress,
            })
            : await ctezToTez(
              {
                deadline,
                minTezBought: minReceived,
                to: userAddress,
                ctezSold: formData.amount,
              },
              userAddress,
            );
        handleProcessing(result);
      } catch (error: any) {
        logger.warn(error);
        const errorText = error.data[1].with.string as string || t('txFailed');
        toast({
          status: 'error',
          description: errorText,
          duration: 5000,
        });
      }
    },
    initialValues,
    validationSchema,
  });

  useEffect(() => {
    formik.validateForm();
  }, [userAddress])

  useEffect(() => {
    const calc = async () => {
      if (values.amount && ctezStorage) {
        const swapAmountNat = new BigNumber(values.amount).multipliedBy(1e6).integerValue(BigNumber.ROUND_FLOOR);
        // const receivedLocalOnchain = (await calcSelfTokensToSellOnchain(formType === FORM_TYPE.TEZ_CTEZ, swapAmountNat)) / 1e6;
        const receivedLocal = (calcSelfTokensToSell(formType === FORM_TYPE.TEZ_CTEZ, ctezStorage, swapAmountNat)) / 1e6;

        const receivedPrice = Number((receivedLocal / values.amount).toFixed(6));
        
        const initialPrice = rate();
        const priceImpactLocal = ((initialPrice - receivedPrice) * 100) / initialPrice;

        setPriceImpact(priceImpactLocal);
        setMinBuyValue(formatNumberStandard(receivedLocal.toFixed(6)));
        const minReceivedLocal = receivedLocal - (receivedLocal * slippage) / 100;
        setReceived(receivedLocal);
        setMinReceived(minReceivedLocal);
      } else {
        setMinBuyValue(0);
        setMinReceived(0);
        setPriceImpact(0);
      };
    }

    calc();
  }, [formType, values.amount, slippage, rate, ctezStorage]);

  const { buttonText, errorList } = useMemo(() => {
    const errorListLocal = Object.values(errors);
    if (!userAddress) {
      return { buttonText: BUTTON_TXT.CONNECT, errorList: [] };
    }

    if (values.amount) {
      if (errorListLocal.length > 0) {
        return { buttonText: errorListLocal[0], errorList: errorListLocal };
      }

      if (received > getDexLiquidity()) {
        return { buttonText: BUTTON_TXT.INSUFFICIENT_DEX_LIQUIDITY, errorList: [BUTTON_TXT.INSUFFICIENT_DEX_LIQUIDITY] };
      }

      return { buttonText: BUTTON_TXT.SWAP, errorList: errorListLocal };
    }

    return { buttonText: BUTTON_TXT.ENTER_AMT, errorList: errorListLocal };
  }, [errors, userAddress, values.amount, minReceived, getDexLiquidity]);

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <FormControl id="from-input-amount">
        <FormLabel color={text2} fontSize="xs">
          From
        </FormLabel>
        <InputGroup>
          <Input
            name="amount"
            id="amount"
            type="text"
            placeholder="0.0"
            color={text2}
            bg={inputbg}
            value={inputFormatNumberStandard(values.amount)}
            onChange={handleChange}
            lang="en-US"
          />
          <TokenInputIcon token={formType === FORM_TYPE.CTEZ_TEZ ? TOKEN.CTez : TOKEN.Tez} />
        </InputGroup>
        <Text color={text4} fontSize="xs" mt={1}>
          Balance:{' '}
          {formType === FORM_TYPE.CTEZ_TEZ
            ? formatNumberStandard(balance?.ctez)
            : formatNumberStandard(balance?.xtz)}{' '}
          <Text
            as="span"
            cursor="pointer"
            color={maxColor}
            onClick={() =>
              formik.setFieldValue(
                'amount',
                formType === FORM_TYPE.CTEZ_TEZ
                  ? formatNumberStandard(balance?.ctez)
                  : formatNumberStandard(balance?.xtz),
              )
            }
          >
            (Max)
          </Text>
        </Text>
      </FormControl>

      <Flex justifyContent="center" mt={2}>
        <IconButton
          variant="ghost"
          size="4xl"
          borderRadius="50%"
          p={2}
          sx={{
            transition: 'transform 0s',
          }}
          _hover={{
            transform: 'rotate(180deg)',
            transition: 'transform 0.5s',
          }}
          aria-label="Swap Token"
          icon={<MdSwapVert />}
          onClick={() =>
            setFormType(formType === FORM_TYPE.CTEZ_TEZ ? FORM_TYPE.TEZ_CTEZ : FORM_TYPE.CTEZ_TEZ)
          }
        />
      </Flex>

      <FormControl id="to-input-amount" mt={0} mb={6}>
        <FormLabel color={text2} fontSize="xs">
          To
        </FormLabel>
        <InputGroup>
          <Input
            isReadOnly
            color={text2}
            bg={inputbg}
            value={formatNumberStandard(minBuyValue || '')}
            placeholder="0.0"
            type="text"
            lang="en-US"
          />
          <TokenInputIcon token={formType === FORM_TYPE.CTEZ_TEZ ? TOKEN.Tez : TOKEN.CTez} />
        </InputGroup>
        <Flex justifyContent="space-between" fontSize="xs" mt={1} wrap="wrap">
          <Text color={text4} fontSize="xs">
            Balance:{' '}
            {formType === FORM_TYPE.CTEZ_TEZ
              ? formatNumberStandard(balance?.xtz)
              : formatNumberStandard(balance?.ctez)}
          </Text>
          <Text color={text4} >
            Dex liquidity:{' '}
            {getDexLiquidity()}{' '}
          </Text>
        </Flex>
      </FormControl>

      <Flex justifyContent="space-between">
        <Text fontSize="xs">Rate</Text>
        <Text color={text2} fontSize="xs">
          1 {formType === FORM_TYPE.CTEZ_TEZ ? 'ctez' : 'tez'} = {rate()}{' '}
          {formType === FORM_TYPE.CTEZ_TEZ ? 'tez' : 'ctez'}
        </Text>
      </Flex>
      <Flex justifyContent="space-between">
        <Text fontSize="xs">Min Received</Text>
        <Text color={text2} fontSize="xs">
          {formatNumberStandard(Number(minReceived))}{' '}
          {formType === FORM_TYPE.CTEZ_TEZ ? 'tez' : 'ctez'}
        </Text>
      </Flex>
      <Flex justifyContent="space-between">
        <Text fontSize="xs">Price Impact</Text>
        <Text color={text2} fontSize="xs">
          {formatNumberStandard(Number(priceImpact))} %
        </Text>
      </Flex>

      <Button
        walletGuard
        width="100%"
        mt={4}
        p={6}
        type="submit"
        disabled={isSubmitting || errorList.length > 0}
        isLoading={isSubmitting}
      >
        {buttonText}
      </Button>
    </form>
  );
};

export { Swap };
