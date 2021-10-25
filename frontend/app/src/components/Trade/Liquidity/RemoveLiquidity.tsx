import {
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Stack,
  useColorModeValue,
  useToast,
  Text,
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { addMinutes } from 'date-fns/fp';
import { validateAddress } from '@taquito/utils';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import { RemoveLiquidityParams } from '../../../interfaces';
import { cfmmError, removeLiquidity } from '../../../contracts/cfmm';
import { IRemoveLiquidityForm, TRemoveBtnTxt, REMOVE_BTN_TXT } from '../../../constants/liquidity';
import { useWallet } from '../../../wallet/hooks';
import { useCfmmStorage, useUserLqtData } from '../../../api/queries';
import Button from '../../button/Button';
import { useAppSelector } from '../../../redux/store';
import { useTxLoader } from '../../../hooks/utilHooks';
import { formatNumber, formatNumberStandard } from '../../../utils/numbers';
import { BUTTON_TXT } from '../../../constants/swap';
import { logger } from '../../../utils/logger';

const RemoveLiquidity: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [otherValues, setOtherValues] = useState({
    cashWithdraw: 0,
    tokenWithdraw: 0,
  });
  const toast = useToast();
  const { data: cfmmStorage } = useCfmmStorage();
  const { t } = useTranslation(['common']);
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const text4Text4 = useColorModeValue('text4', 'text4');
  const { slippage, deadline: deadlineFromStore } = useAppSelector((state) => state.trade);
  const handleProcessing = useTxLoader();
  const { data: userLqtData } = useUserLqtData(userAddress);

  const calcMinValues = useCallback(
    (lqtBurned: number) => {
      if (!lqtBurned) {
        setOtherValues({
          cashWithdraw: 0,
          tokenWithdraw: 0,
        });
      } else if (cfmmStorage) {
        const { cashPool, tokenPool, lqtTotal } = cfmmStorage;
        const cashWithdraw =
          ((lqtBurned * 1e6 * cashPool.toNumber()) / lqtTotal.toNumber()) * (1 - slippage * 0.01);
        const tokenWithdraw =
          ((lqtBurned * 1e6 * tokenPool.toNumber()) / lqtTotal.toNumber()) * (1 - slippage * 0.01);
        setOtherValues({
          cashWithdraw: Number((cashWithdraw / 1e6).toFixed(6)),
          tokenWithdraw: Number((tokenWithdraw / 1e6).toFixed(6)),
        });
      }
    },
    [cfmmStorage, slippage],
  );

  const initialValues: any = {
    to: userAddress ?? '',
    lqtBurned: '',
    deadline: Number(deadlineFromStore),
    slippage: Number(slippage),
  };

  const maxValue = (): number => formatNumber(userLqtData?.lqt || 0.0);

  const validationSchema = object().shape({
    to: string().test({
      test: (value: any) => validateAddress(value) === 3,
    }),
    lqtBurned: number()
      .positive(t('shouldPositive'))
      .required(t('required'))
      .max(maxValue(), `${t('insufficientBalance')}`),
    deadline: number().min(0).optional(),
    slippage: number().min(0).optional(),
  });

  const handleFormSubmit = async (formData: IRemoveLiquidityForm) => {
    if (userAddress) {
      try {
        const deadline = addMinutes(deadlineFromStore)(new Date());
        const data: RemoveLiquidityParams = {
          deadline,
          to: formData.to,
          lqtBurned: formData.lqtBurned * 1e6,
          minCashWithdrawn: otherValues.cashWithdraw,
          minTokensWithdrawn: otherValues.tokenWithdraw,
        };
        const result = await removeLiquidity(data, userAddress);
        handleProcessing(result);
      } catch (error) {
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
    calcMinValues(Number(values.lqtBurned));
  }, [calcMinValues, values.slippage, values.lqtBurned]);

  const { buttonText, errorList } = useMemo(() => {
    logger.info(errors);
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
          />
          {typeof userLqtData?.lqt !== 'undefined' && (
            <Text color={text4Text4} fontSize="xs" mt={1}>
              Balance: {formatNumberStandard(userLqtData?.lqt)}{' '}
              <Text
                as="span"
                cursor="pointer"
                color="#e35f5f"
                onClick={() =>
                  formik.setFieldValue('lqtBurned', formatNumberStandard(userLqtData?.lqt))
                }
              >
                (Max)
              </Text>
            </Text>
          )}
        </FormControl>

        <Flex alignItems="center" justifyContent="space-between">
          <FormControl id="to-input-amount" w="45%">
            <FormLabel color={text2} fontSize="xs">
              Min. tez to withdraw
            </FormLabel>
            <Input
              readOnly
              border={0}
              placeholder="0.0"
              type="number"
              color={text2}
              value={otherValues.cashWithdraw}
            />
          </FormControl>

          <Icon as={MdAdd} mb="-25" fontSize="lg" />
          <FormControl id="to-input-amount" w="45%">
            <FormLabel color={text2} fontSize="xs">
              Min. ctez to withdraw
            </FormLabel>
            <Input
              readOnly
              border={0}
              placeholder="0.0"
              type="number"
              color={text2}
              value={otherValues.tokenWithdraw}
            />
          </FormControl>
        </Flex>
        <Button
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
