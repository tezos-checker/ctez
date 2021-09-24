import {
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Stack,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { addMinutes } from 'date-fns/fp';
import { validateAddress } from '@taquito/utils';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import { RemoveLiquidityParams } from '../../interfaces';
import { cfmmError, removeLiquidity } from '../../contracts/cfmm';
import { IRemoveLiquidityForm, TRemoveBtnTxt, REMOVE_BTN_TXT } from '../../constants/liquidity';
import { useWallet } from '../../wallet/hooks';
import { useCfmmStorage } from '../../api/queries';
import { DEFAULT_SLIPPAGE } from '../../utils/globals';
import Button from '../button/Button';

const RemoveLiquidity: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [otherValues, setOtherValues] = useState({
    cashWithdraw: 0,
    tokenWithdraw: 0,
  });
  const toast = useToast();
  const { data: cfmmStorage } = useCfmmStorage();
  const { t } = useTranslation(['common']);
  const [buttonText, setButtonText] = useState<TRemoveBtnTxt>(REMOVE_BTN_TXT.ENTER_AMT);
  const { colorMode } = useColorMode();
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');

  const calcMinValues = useCallback(
    (slippage: number, lqtBurned: number) => {
      if (!lqtBurned) {
        setOtherValues({
          cashWithdraw: 0,
          tokenWithdraw: 0,
        });
      } else if (cfmmStorage) {
        const { cashPool, tokenPool, lqtTotal } = cfmmStorage;
        const cashWithdraw =
          ((lqtBurned * cashPool.toNumber()) / lqtTotal.toNumber()) * (1 - slippage * 0.01);
        const tokenWithdraw =
          ((lqtBurned * tokenPool.toNumber()) / lqtTotal.toNumber()) * (1 - slippage * 0.01);
        setOtherValues({
          cashWithdraw: Number((cashWithdraw / 1e6).toFixed(6)),
          tokenWithdraw: Number((tokenWithdraw / 1e6).toFixed(6)),
        });
      }
    },
    [cfmmStorage],
  );

  const initialValues: any = {
    to: userAddress ?? '',
    lqtBurned: '',
    deadline: 20,
    slippage: DEFAULT_SLIPPAGE,
  };

  const validationSchema = object().shape({
    to: string().test({
      test: (value: any) => validateAddress(value) === 3,
    }),
    lqtBurned: number()
      .min(1, `${t('shouldMinimum')} 1`)
      .positive(t('shouldPositive'))
      .integer(t('shouldInteger'))
      .required(t('required')),
    deadline: number().min(0).optional(),
    slippage: number().min(0).optional(),
  });

  const handleFormSubmit = async (formData: IRemoveLiquidityForm) => {
    if (userAddress) {
      try {
        const deadline = addMinutes(formData.deadline)(new Date());
        const data: RemoveLiquidityParams = {
          deadline,
          to: formData.to,
          lqtBurned: formData.lqtBurned,
          minCashWithdrawn: otherValues.cashWithdraw,
          minTokensWithdrawn: otherValues.tokenWithdraw,
        };
        const result = await removeLiquidity(data, userAddress);
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
      } catch (error) {
        const errorText = cfmmError[error.data[1].with.int as number] || t('txFailed');
        toast({
          description: errorText,
          status: 'error',
        });
      }
    }
  };

  const { values, handleChange, handleSubmit, isSubmitting } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });

  useEffect(() => {
    calcMinValues(values.slippage, Number(values.lqtBurned));
  }, [calcMinValues, values.slippage, values.lqtBurned]);

  useEffect(() => {
    if (!userAddress) {
      setButtonText(REMOVE_BTN_TXT.CONNECT);
    } else if (values.lqtBurned) {
      setButtonText(REMOVE_BTN_TXT.REMOVE_LIQ);
    } else {
      setButtonText(REMOVE_BTN_TXT.ENTER_AMT);
    }
  }, [buttonText, userAddress, values.lqtBurned]);

  return (
    <form onSubmit={handleSubmit} id="remove-liquidity-form">
      <Stack colorScheme="gray" spacing={2}>
        <FormControl id="to-input-amount" mb={2}>
          <FormLabel color={text2} fontSize="xs">
            LQT to burn
          </FormLabel>
          <Input
            type="number"
            name="lqtBurned"
            id="lqtBurned"
            value={values.lqtBurned}
            color={text4}
            bg={inputbg}
            onChange={handleChange}
          />
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
              color={text4}
              bg={inputbg}
              value={otherValues.cashWithdraw}
            />
          </FormControl>

          <Icon as={MdAdd} />
          <FormControl id="to-input-amount" w="45%">
            <FormLabel color={text2} fontSize="xs">
              Min. ctez to withdraw
            </FormLabel>
            <Input
              readOnly
              border={0}
              placeholder="0.0"
              type="number"
              color={text4}
              value={otherValues.tokenWithdraw}
            />
          </FormControl>
        </Flex>
        <Button variant="outline" type="submit" isLoading={isSubmitting}>
          {buttonText}
        </Button>
      </Stack>
    </form>
  );
};

export default RemoveLiquidity;
