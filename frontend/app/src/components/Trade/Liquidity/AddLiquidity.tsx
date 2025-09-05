import { Flex, FormControl, FormLabel, Input, InputGroup, Stack, Text, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { number, object } from 'yup';
import { addMinutes } from 'date-fns/fp';
import { useFormik } from 'formik';
import BigNumber from 'bignumber.js';
import { useWallet } from '../../../wallet/hooks';
import { useCtezStorage, useUserBalance } from '../../../api/queries';

import { AddLiquidityParams, HalfDex } from '../../../interfaces';
import { ADD_BTN_TXT, IAddLiquidityForm } from '../../../constants/liquidity';
import { addLiquidity } from '../../../contracts/ctez';
import { logger } from '../../../utils/logger';
import { BUTTON_TXT, TOKEN } from '../../../constants/swap';
import Button from '../../button';
import { useAppSelector } from '../../../redux/store';
import { useThemeColors, useTxLoader } from '../../../hooks/utilHooks';
import { formatNumberStandard, inputFormatNumberStandard } from '../../../utils/numbers';
import DexSideSelector, { DexSide } from './DexSideSelector';
import TokenInputIcon from '../TokenInputIcon';

const calcLiquidityMinted = (depositAmount: number, dex: HalfDex): BigNumber => {
  const numerator = BigNumber.max(dex.total_liquidity_shares, 1);
  const denominator = BigNumber.max(dex.self_reserves, 1);
  return new BigNumber(depositAmount).multipliedBy(numerator).dividedBy(denominator).integerValue(BigNumber.ROUND_FLOOR);
}

const AddLiquidity: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [minLqt, setMinLqt] = useState('0');
  const { data: balance } = useUserBalance(userAddress);
  const { data: ctezStorage } = useCtezStorage();
  const [side, setSide] = React.useState<DexSide>('ctez')
  const { t } = useTranslation(['common']);
  const toast = useToast();
  const [text2, inputbg, text4, maxColor] = useThemeColors([
    'text2',
    'inputbg',
    'text4',
    'maxColor',
  ]);
  const { slippage, deadline: deadlineFromStore } = useAppSelector((state) => state.trade);
  const handleProcessing = useTxLoader();

  const isCtezSide = side === 'ctez';
  const tokenBalance = isCtezSide ? balance?.ctez : balance?.xtz;

  const calcMinLqt = useCallback(
    (amountDeposited: number) => {
      if (ctezStorage) {
        const dex = isCtezSide ? ctezStorage.sell_ctez : ctezStorage.sell_tez;
        const amountNat = amountDeposited * 1e6;
        const minLQTMinted = calcLiquidityMinted(amountNat, dex).multipliedBy(1 - slippage * 0.01);
        setMinLqt(minLQTMinted.integerValue(BigNumber.ROUND_FLOOR).toString(10));
      }
      else {
        setMinLqt('-1');
      }
    },
    [slippage, side, ctezStorage],
  );

  const initialValues: IAddLiquidityForm = {
    slippage: Number(slippage),
    deadline: Number(deadlineFromStore),
    amount: '',
  };

  const maxValue = (): number => (tokenBalance || 0.0);

  const validationSchema = object().shape({
    slippage: number().min(0).optional(),
    deadline: number().min(0).optional(),
    amount: number()
      .typeError('Amount must be a number')
      .min(0.000001, `${t('shouldMinimum')} 0.000001`)
      .max(maxValue(), `${t('insufficientBalance')}`)
      .positive(t('shouldPositive'))
      .required(t('required')),
  });

  const handleFormSubmit = async (formData: IAddLiquidityForm) => {
    if (userAddress && formData.amount) {
      try {
        const deadline = addMinutes(deadlineFromStore)(new Date());
        const data: AddLiquidityParams = {
          deadline,
          amount: formData.amount,
          owner: userAddress,
          minLqtMinted: new BigNumber(minLqt),
          isCtezSide
        };
        const result = await addLiquidity(data);
        handleProcessing(result);
      } catch (error: any) {
        logger.error(error);
        const errorText = error.data[1].with.string as string || t('txFailed');
        toast({
          description: errorText,
          status: 'error',
        });
      }
    }
  };

  const { values, handleChange, handleSubmit, isSubmitting, errors, ...formik } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });

  const onHandleSideChanged = useCallback((sideValue: DexSide) => {
    setSide(sideValue);
    formik.setFieldValue('amount', 0);
  }, []);

  useEffect(() => {
    calcMinLqt(Number(values.amount));
  }, [calcMinLqt, values.amount, side]);

  const { buttonText, errorList } = useMemo(() => {
    const errorListLocal = Object.values(errors);
    if (values.amount) {
      if (errorListLocal.length > 0) {
        return { buttonText: errorListLocal[0], errorList: errorListLocal };
      }

      return { buttonText: ADD_BTN_TXT.ADD_LIQ, errorList: errorListLocal };
    }

    return { buttonText: BUTTON_TXT.ENTER_AMT, errorList: errorListLocal };
  }, [errors, values.amount]);

  return (
    <form onSubmit={handleSubmit} id="add-liquidity-form">
      <Stack spacing={2}>
        <Text color={text2}>Add liquidity</Text>
        <DexSideSelector onChange={onHandleSideChanged} value={side} />
        <Flex alignItems="center" justifyContent="space-between">
          <FormControl
            display="flex"
            flexDirection="column"
            id="to-input-amount"
            mt={-2}
            mb={4}
            w="100%"
          >
            <FormLabel color={text2} fontSize="xs">
              Deposit
            </FormLabel>
            <InputGroup>
              <Input
                name="amount"
                id="amount"
                placeholder="0.0"
                color={text2}
                bg={inputbg}
                value={inputFormatNumberStandard(values.amount)}
                onChange={handleChange}
                type="text"
                lang="en-US"
              />
              <TokenInputIcon token={isCtezSide ? TOKEN.CTez : TOKEN.Tez} />
            </InputGroup>
            <Text color={text4} fontSize="xs" mt={1}>
              Balance: {formatNumberStandard(tokenBalance)}{' '}
              <Text
                as="span"
                cursor="pointer"
                color={maxColor}
                onClick={() => formik.setFieldValue('amount', formatNumberStandard(tokenBalance))}
              >
                (Max)
              </Text>
            </Text>
          </FormControl>
        </Flex>

        <Button
          walletGuard
          w="100%"
          variant="outline"
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || errorList.length > 0}
        >
          {buttonText}
        </Button>
      </Stack>
    </form>
  );
};

export default AddLiquidity;
