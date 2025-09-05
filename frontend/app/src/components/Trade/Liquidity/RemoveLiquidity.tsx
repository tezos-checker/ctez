import { Flex, FormControl, FormLabel, Input, Stack, useToast, Text, InputGroup } from '@chakra-ui/react';
import { addMinutes } from 'date-fns/fp';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import BigNumber from 'bignumber.js';
import { RemoveLiquidityParams } from '../../../interfaces';
import { removeLiquidity } from '../../../contracts/ctez';
import { IRemoveLiquidityForm, REMOVE_BTN_TXT } from '../../../constants/liquidity';
import { useWallet } from '../../../wallet/hooks';
import { useActualCtezStorage, useUserLqtData } from '../../../api/queries';
import Button from '../../button';
import { useAppSelector } from '../../../redux/store';
import { useThemeColors, useTxLoader } from '../../../hooks/utilHooks';
import { BUTTON_TXT, TOKEN } from '../../../constants/swap';
import { calcRedeemedAmount } from './utlils';
import DexSideSelector, { DexSide } from './DexSideSelector';
import TokenInputIcon from '../TokenInputIcon';

const RemoveLiquidity: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [side, setSide] = React.useState<DexSide>('ctez')
  const [otherValues, setOtherValues] = useState({
    minSelfReceived: '0',
    minProceedsReceived: '0',
    minSubsidyReceived: '0',
  });
  const toast = useToast();
  const { data: ctezStorage } = useActualCtezStorage();
  const { t } = useTranslation(['common']);
  const [text2, inputbg, text4, maxColor] = useThemeColors([
    'text2',
    'inputbg',
    'text4',
    'maxColor',
  ]);
  const { slippage, deadline: deadlineFromStore } = useAppSelector((state) => state.trade);
  const handleProcessing = useTxLoader();
  const { data: userLqtData } = useUserLqtData(userAddress);

  const isCtezSide = side === 'ctez';
  const lqtBalance = ((isCtezSide ? userLqtData?.ctezDexLqt : userLqtData?.tezDexLqt) ?? new BigNumber(0)).dividedBy(1e6);

  const calcMinValues = useCallback(
    async (lqtBurned: BigNumber) => {
      if (!lqtBurned) {
        setOtherValues({
          minSelfReceived: '0',
          minProceedsReceived: '0',
          minSubsidyReceived: '0',
        });
      } else if (ctezStorage && userAddress) {
        const dex = isCtezSide ?ctezStorage.sell_ctez : ctezStorage.sell_tez;
        const account = await dex.liquidity_owners.get(userAddress);
        const slippageFactor = (1 - slippage * 0.01);
        const lqtBurnedNat = BigNumber.min(lqtBurned, lqtBalance).multipliedBy(1e6);
        const minSelfReceived = calcRedeemedAmount(lqtBurnedNat, dex.self_reserves, dex.total_liquidity_shares, new BigNumber(0)).multipliedBy(slippageFactor);
        const minProceedsReceived = calcRedeemedAmount(lqtBurnedNat, dex.proceeds_reserves, dex.total_liquidity_shares, account?.proceeds_owed || new BigNumber(0)).multipliedBy(slippageFactor);
        const minSubsidyReceived = calcRedeemedAmount(lqtBurnedNat, dex.subsidy_reserves, dex.total_liquidity_shares, account?.subsidy_owed || new BigNumber(0)).multipliedBy(slippageFactor);

        setOtherValues({
          minSelfReceived: minSelfReceived.dividedBy(1e6).toFixed(6, BigNumber.ROUND_CEIL),
          minProceedsReceived: minProceedsReceived.dividedBy(1e6).toFixed(6, BigNumber.ROUND_CEIL),
          minSubsidyReceived: minSubsidyReceived.dividedBy(1e6).toFixed(6, BigNumber.ROUND_CEIL),
        });
      }
    },
    [ctezStorage, slippage, side],
  );

  const initialValues: IRemoveLiquidityForm = {
    lqtBurned: lqtBalance.toString(10),
    deadline: Number(deadlineFromStore),
    slippage: Number(slippage),
  };

  const validationSchema = object().shape({
    lqtBurned: string()
      .required(t('required'))
      .test({
        test: (value) => {
          return !!value && !(new BigNumber(value).isNaN());
        },
        message: 'Amount must be a number',
      })
      .test({
        test: (value) => {
          return !!value && new BigNumber(value).isLessThanOrEqualTo(lqtBalance);
        },
        message: t('insufficientBalance'),
      })
      .test({
        test: (value) => {
          return !!value && new BigNumber(value).isPositive();
        },
        message: t('shouldPositive'),
      }),
    deadline: number().min(0).optional(),
    slippage: number().min(0).optional(),
  });

  const handleFormSubmit = async (formData: IRemoveLiquidityForm) => {
    if (userAddress) {
      try {
        const deadline = addMinutes(deadlineFromStore)(new Date());
        const data: RemoveLiquidityParams = {
          deadline,
          to: userAddress,
          lqtBurned: new BigNumber(formData.lqtBurned).multipliedBy(1e6),
          minSelfReceived: new BigNumber(otherValues.minSelfReceived).multipliedBy(1e6),
          minProceedsReceived: new BigNumber(otherValues.minProceedsReceived).multipliedBy(1e6),
          minSubsidyReceived: new BigNumber(otherValues.minSubsidyReceived).multipliedBy(1e6),
          isCtezSide,
        };
        const result = await removeLiquidity(data, userAddress);
        handleProcessing(result);
      } catch (error: any) {
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
  }, []);

  useEffect(() => {
    formik.setFieldValue('lqtBurned', lqtBalance.toString(10));
  }, [lqtBalance.toString(10)]);

  useEffect(() => {
    calcMinValues(new BigNumber(values.lqtBurned));
  }, [calcMinValues, values.slippage, values.lqtBurned, side]);

  const { buttonText, errorList } = useMemo(() => {
    const errorListLocal = Object.values(errors);
    if (!userAddress) {
      return { buttonText: BUTTON_TXT.CONNECT, errorList: errorListLocal };
    }
    if (values.lqtBurned) {
      if (errorListLocal.length > 0) {
        return { buttonText: errorListLocal[0], errorList: errorListLocal };
      }

      return { buttonText: REMOVE_BTN_TXT.REMOVE_LIQ, errorList: errorListLocal };
    }

    return { buttonText: BUTTON_TXT.ENTER_AMT, errorList: errorListLocal };
  }, [errors, userAddress, values.lqtBurned]);

  return (
    <form onSubmit={handleSubmit} id="remove-liquidity-form">
      <Stack colorScheme="gray" spacing={2}>
        <DexSideSelector onChange={onHandleSideChanged} value={side} />
        <FormControl id="to-input-amount" mb={2}>
          <FormLabel color={text2} fontSize="xs">
            LQT to burn
          </FormLabel>
          <Input
            name="lqtBurned"
            id="lqtBurned"
            value={values.lqtBurned}
            color={text2}
            bg={inputbg}
            onChange={handleChange}
            placeholder="0.0"
            type="text"
            lang="en-US"
          />
          {typeof lqtBalance !== 'undefined' && (
            <Text color={text4} fontSize="xs" mt={1} mb={2} display="flex" flexWrap="nowrap" gridGap={1}>
              <Text as="span" flexShrink={1} isTruncated>
                Balance: {lqtBalance.toString(10)}
              </Text>
              <Text
                as="span"
                cursor="pointer"
                color={maxColor}
                onClick={() =>
                  formik.setFieldValue('lqtBurned', lqtBalance.toString(10))
                }
              >
                (Max)
              </Text>
            </Text>
          )}
        </FormControl>

        <Flex alignItems="center" direction="column" justifyContent="space-between">
          <FormControl id="to-input-amount">
            <FormLabel color={text2} fontSize="xs">
              Min. self tokens to withdraw
            </FormLabel>
            <InputGroup>
              <Input
                readOnly
                mb={2}
                placeholder="0.0"
                type="text"
                color={text2}
                lang="en-US"
                value={otherValues.minSelfReceived}
              />
              <TokenInputIcon token={isCtezSide ? TOKEN.CTez : TOKEN.Tez} />
            </InputGroup>
          </FormControl>

          <FormControl id="to-input-amount">
            <FormLabel color={text2} fontSize="xs">
              Min. proceeds to withdraw
            </FormLabel>
            <InputGroup>
              <Input
                readOnly
                mb={2}
                placeholder="0.0"
                type="text"
                color={text2}
                lang="en-US"
                value={otherValues.minProceedsReceived}
              />
              <TokenInputIcon token={isCtezSide ? TOKEN.Tez : TOKEN.CTez} />
            </InputGroup>
          </FormControl>

          <FormControl id="to-input-amount">
            <FormLabel color={text2} fontSize="xs">
              Min. subsidy to withdraw
            </FormLabel>
            <InputGroup>
              <Input
                readOnly
                mb={2}
                placeholder="0.0"
                type="text"
                color={text2}
                lang="en-US"
                value={otherValues.minSubsidyReceived}
              />
              <TokenInputIcon token={TOKEN.CTez} />
            </InputGroup>
          </FormControl>
        </Flex>
        <Button
          walletGuard
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

export default RemoveLiquidity;
