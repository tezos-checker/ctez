import {
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Stack,
  Text,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { number, object } from 'yup';
import { addMinutes } from 'date-fns/fp';
import { useFormik } from 'formik';
import { useWallet } from '../../wallet/hooks';
import { useCfmmStorage } from '../../api/queries';
import { DEFAULT_SLIPPAGE } from '../../utils/globals';

import { AddLiquidityParams } from '../../interfaces';
import { ADD_BTN_TXT, IAddLiquidityForm, TAddBtnTxt } from '../../constants/liquidity';
import { addLiquidity, cfmmError } from '../../contracts/cfmm';
import { logger } from '../../utils/logger';
import { BUTTON_TXT } from '../../constants/swap';
import Button from '../button/Button';

const AddLiquidity: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [maxTokens, setMaxToken] = useState(0);
  const [minLQT, setMinLQT] = useState(0);
  const [buttonText, setButtonText] = useState<TAddBtnTxt>(BUTTON_TXT.ENTER_AMT);
  const { data: cfmmStorage } = useCfmmStorage();
  const { t } = useTranslation();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const calcMaxToken = useCallback(
    (slippage: number, cashDeposited: number) => {
      if (cfmmStorage) {
        const { tokenPool, cashPool, lqtTotal } = cfmmStorage;
        const cash = cashDeposited * 1e6;
        const max =
          Math.ceil(((cash * tokenPool.toNumber()) / cashPool.toNumber()) * (1 + slippage * 0.01)) /
          1e6;
        setMaxToken(Number(max.toFixed(6)));
        const minLQTMinted =
          ((cash * lqtTotal.toNumber()) / cashPool.toNumber()) * (1 - slippage * 0.01);
        setMinLQT(Number(Math.floor(minLQTMinted).toFixed()));
      } else {
        setMaxToken(-1);
        setMinLQT(-1);
      }
    },
    [cfmmStorage],
  );

  const initialValues: any = {
    slippage: DEFAULT_SLIPPAGE,
    deadline: 20,
    amount: '',
  };

  const validationSchema = object().shape({
    slippage: number().min(0).optional(),
    deadline: number().min(0).optional(),
    amount: number()
      .min(0.000001, `${t('shouldMinimum')} 0.000001`)
      .positive(t('shouldPositive'))
      .required(t('required')),
  });

  const handleFormSubmit = async (formData: IAddLiquidityForm) => {
    if (userAddress) {
      try {
        const deadline = addMinutes(formData.deadline)(new Date());
        const data: AddLiquidityParams = {
          deadline,
          amount: formData.amount,
          owner: userAddress,
          maxTokensDeposited: maxTokens,
          minLqtMinted: minLQT,
        };
        const result = await addLiquidity(data);
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
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

  const { values, handleChange, handleSubmit, isSubmitting } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });

  useEffect(() => {
    calcMaxToken(0, Number(values.amount));
  }, [calcMaxToken, values.amount]);

  useEffect(() => {
    if (!userAddress) {
      setButtonText(ADD_BTN_TXT.CONNECT);
    } else if (values.amount) {
      setButtonText(ADD_BTN_TXT.ADD_LIQ);
    } else {
      setButtonText(ADD_BTN_TXT.ENTER_AMT);
    }
  }, [buttonText, userAddress, values.amount]);

  return (
    <form onSubmit={handleSubmit} id="add-liquidity-form">
      <Stack spacing={2}>
        <Text color={colorMode === 'light' ? 'text2' : 'darkheading'}>Add liquidity</Text>

        <Flex alignItems="center" justifyContent="space-between">
          <FormControl id="to-input-amount" mt={-2} mb={6} w="45%">
            <FormLabel color={colorMode === 'light' ? 'text2' : 'darkheading'} fontSize="xs">
              tez to deposit
            </FormLabel>
            <Input
              type="number"
              name="amount"
              id="amount"
              color={colorMode === 'light' ? 'text4' : 'darkheading'}
              bg={colorMode === 'light' ? 'darkheading' : 'textboxbg'}
              value={values.amount}
              onChange={handleChange}
            />
          </FormControl>

          <Icon as={MdAdd} />
          <FormControl id="to-input-amount" mt={-2} mb={6} w="45%">
            <FormLabel color={colorMode === 'light' ? 'text2' : 'darkheading'} fontSize="xs">
              ctez to deposit(approx)
            </FormLabel>
            <Input
              value={maxTokens}
              readOnly
              border={0}
              color={colorMode === 'light' ? 'text4' : 'darkheading'}
              placeholder="0.0"
              type="number"
            />
          </FormControl>
        </Flex>

        <Button w="100%" variant="outline" type="submit" isLoading={isSubmitting}>
          {buttonText}
        </Button>
      </Stack>
    </form>
  );
};

export default AddLiquidity;
