import {
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { number, object } from 'yup';
import { addMinutes } from 'date-fns/fp';
import { useFormik } from 'formik';
import { useWallet } from '../../../wallet/hooks';
import { useCfmmStorage, useUserBalance } from '../../../api/queries';

import { AddLiquidityParams } from '../../../interfaces';
import { ADD_BTN_TXT, IAddLiquidityForm } from '../../../constants/liquidity';
import { addLiquidity, cfmmError } from '../../../contracts/cfmm';
import { logger } from '../../../utils/logger';
import { BUTTON_TXT } from '../../../constants/swap';
import Button from '../../button/Button';
import { useAppSelector } from '../../../redux/store';
import { useTxLoader } from '../../../hooks/utilHooks';
import { formatNumberStandard } from '../../../utils/numbers';

const AddLiquidity: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [minLQT, setMinLQT] = useState(0);
  const { data: cfmmStorage } = useCfmmStorage();
  const { data: balance } = useUserBalance(userAddress);
  const { t } = useTranslation(['common']);
  const toast = useToast();
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const text4Text4 = useColorModeValue('text4', 'text4');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const { slippage, deadline: deadlineFromStore } = useAppSelector((state) => state.trade);
  const handleProcessing = useTxLoader();

  const calcMaxToken = useCallback(
    (cashDeposited: number, setFieldValue) => {
      if (cfmmStorage) {
        const { tokenPool, cashPool, lqtTotal } = cfmmStorage;
        const cash = cashDeposited * 1e6;
        const max =
          Math.ceil(((cash * tokenPool.toNumber()) / cashPool.toNumber()) * (1 + slippage * 0.01)) /
          1e6;

        setFieldValue('ctezAmount', Number(max.toFixed(6)));
        const minLQTMinted =
          ((cash * lqtTotal.toNumber()) / cashPool.toNumber()) * (1 - slippage * 0.01);
        setMinLQT(Number(Math.floor(minLQTMinted).toFixed()));
      } else {
        setFieldValue('ctezAmount', -1);
        setMinLQT(-1);
      }
    },
    [cfmmStorage, slippage],
  );

  const initialValues: any = {
    slippage: Number(slippage),
    deadline: Number(deadlineFromStore),
    amount: undefined,
    ctezAmount: undefined,
  };

  const maxValue = (): number => balance?.xtz || 0.0;
  const maxCtezValue = (): number => balance?.ctez || 0.0;

  const validationSchema = object().shape({
    slippage: number().min(0).optional(),
    deadline: number().min(0).optional(),
    amount: number()
      .min(0.000001, `${t('shouldMinimum')} 0.000001`)
      .max(maxValue(), `${t('insufficientBalance')}`)
      .positive(t('shouldPositive'))
      .required(t('required')),
    ctezAmount: number()
      .min(0.000001, `${t('shouldMinimum')} 0.000001`)
      .max(maxCtezValue(), 'Insufficient ctez Balance')
      .positive(t('shouldPositive')),
  });

  const handleFormSubmit = async (formData: IAddLiquidityForm) => {
    if (userAddress && formData.amount && formData.ctezAmount) {
      try {
        const deadline = addMinutes(deadlineFromStore)(new Date());
        const data: AddLiquidityParams = {
          deadline,
          amount: formData.amount,
          owner: userAddress,
          maxTokensDeposited: formData.ctezAmount,
          minLqtMinted: minLQT,
        };
        const result = await addLiquidity(data);
        handleProcessing(result);
      } catch (error) {
        logger.error(error);
        const errorText = cfmmError[error.data[1].with.int as number] || t('txFailed');
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

  useEffect(() => {
    calcMaxToken(Number(values.amount), formik.setFieldValue);
  }, [calcMaxToken, values.amount, formik.setFieldValue]);

  const { buttonText, errorList } = useMemo(() => {
    logger.info(errors);
    const errorListLocal = Object.values(errors);
    if (!userAddress) {
      return { buttonText: BUTTON_TXT.CONNECT, errorList: errorListLocal };
    }
    if (values.amount) {
      if (errorListLocal.length > 0) {
        return { buttonText: errorListLocal[0], errorList: errorListLocal };
      }

      // TODO validate ctez balance
      return { buttonText: ADD_BTN_TXT.ADD_LIQ, errorList: errorListLocal };
    }

    return { buttonText: BUTTON_TXT.ENTER_AMT, errorList: errorListLocal };
  }, [errors, userAddress, values.amount]);

  return (
    <form onSubmit={handleSubmit} id="add-liquidity-form">
      <Stack spacing={2}>
        <Text color={text2}>Add liquidity</Text>

        <Flex alignItems="center" justifyContent="space-between">
          <FormControl
            display="flex"
            flexDirection="column"
            id="to-input-amount"
            mt={-2}
            mb={4}
            w="45%"
          >
            <FormLabel color={text2} fontSize="xs">
              tez to deposit
            </FormLabel>
            <Input
              name="amount"
              id="amount"
              placeholder="0.0"
              color={text2}
              bg={inputbg}
              value={values.amount}
              onChange={handleChange}
            />
            <Text color={text4Text4} fontSize="xs" mt={1}>
              Balance: {formatNumberStandard(balance?.xtz)}{' '}
              <Text
                as="span"
                cursor="pointer"
                color="#e35f5f"
                onClick={() => formik.setFieldValue('amount', formatNumberStandard(balance?.xtz))}
              >
                (Max)
              </Text>
            </Text>
          </FormControl>

          <Flex mt={1} mb={5}>
            <Icon as={MdAdd} fontSize="lg" />
          </Flex>

          <FormControl id="to-input-amount" mb={6} w="45%">
            <FormLabel color={text2} fontSize="xs">
              ctez to deposit(approx)
            </FormLabel>
            <Input
              value={values.ctezAmount}
              readOnly
              border={0}
              color={text2}
              placeholder="0.0"
              type="number"
            />
            <Text color={text4Text4} fontSize="xs" mt={1}>
              Balance: {formatNumberStandard(balance?.ctez)}
            </Text>
          </FormControl>
        </Flex>

        <Button
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
