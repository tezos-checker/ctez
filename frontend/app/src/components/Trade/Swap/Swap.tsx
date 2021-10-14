import {
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdAdd, MdSwapVert } from 'react-icons/md';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { number, object } from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { addMinutes } from 'date-fns/fp';
import { useWallet } from '../../../wallet/hooks';
import { useCfmmStorage } from '../../../api/queries';
import {
  BUTTON_TXT,
  ConversionFormParams,
  FORM_TYPE,
  TButtonText,
  TFormType,
  TOKEN,
  TToken,
} from '../../../constants/swap';
import { CTezIcon, TezIcon } from '../../icons';
import { cashToToken, cfmmError, tokenToCash } from '../../../contracts/cfmm';
import { logger } from '../../../utils/logger';
import { useSetCtezBaseStatsToStore } from '../../../hooks/setApiDataToStore';
import { useAppSelector } from '../../../redux/store';
import Button from '../../button/Button';
import { useTxLoader } from '../../../hooks/utilHooks';

const Swap: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [minBuyValue, setMinBuyValue] = useState(0);
  const [formType, setFormType] = useState<TFormType>(FORM_TYPE.TEZ_CTEZ);
  const [buttonText, setButtonText] = useState<TButtonText>(BUTTON_TXT.ENTER_AMT);
  const { data: cfmmStorage } = useCfmmStorage();
  const { t } = useTranslation(['common', 'header']);
  const toast = useToast();
  useSetCtezBaseStatsToStore(userAddress);
  const baseStats = useAppSelector((state) => state.stats?.baseStats);
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const handleProcessing = useTxLoader();

  const { slippage, deadline: deadlineFromStore } = useAppSelector((state) => state.trade);

  const getRightElement = useCallback((token: TToken) => {
    if (token === TOKEN.Tez) {
      return (
        <InputRightElement backgroundColor="transparent" w={24}>
          <TezIcon height={28} width={28} />
          <Text mx={1}>tez</Text>
        </InputRightElement>
      );
    }

    return (
      <InputRightElement backgroundColor="transparent" w={24}>
        <CTezIcon height={28} width={28} />
        <Text mx={1}>ctez</Text>
      </InputRightElement>
    );
  }, []);

  const initialValues = useMemo<ConversionFormParams>(
    () => ({
      to: userAddress ?? '',
      slippage: Number(slippage),
      deadline: Number(deadlineFromStore),
      amount: 0,
    }),
    [deadlineFromStore, slippage, userAddress],
  );

  const validationSchema = useMemo(
    () =>
      object().shape({
        slippage: number().min(0).optional(),
        deadline: number().min(0).required(t('required')),
        amount: number()
          .min(0.000001, `${t('shouldMinimum')} 0.000001`)
          .positive(t('shouldPositive'))
          .required(t('required')),
      }),
    [t],
  );

  const { values, handleChange, handleSubmit, isSubmitting } = useFormik({
    onSubmit: async (formData) => {
      try {
        if (!userAddress) {
          return;
        }
        const deadline = addMinutes(deadlineFromStore)(new Date());
        const result =
          formType === FORM_TYPE.TEZ_CTEZ
            ? await cashToToken({
                amount: formData.amount,
                deadline,
                minTokensBought: minBuyValue,
                to: formData.to,
              })
            : await tokenToCash(
                {
                  deadline,
                  minCashBought: minBuyValue,
                  to: formData.to,
                  tokensSold: formData.amount,
                },
                userAddress,
              );
        handleProcessing(result, () => (
          <Flex direction="row-reverse">
            <Spinner />
          </Flex>
        ));
      } catch (error) {
        logger.warn(error);
        const errorText = cfmmError[error.data[1].with.int as number] || t('txFailed');
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
    if (cfmmStorage) {
      const { tokenPool, cashPool } = cfmmStorage;
      const cashSold = values.amount * 1e6;
      const [aPool, bPool] =
        formType === FORM_TYPE.TEZ_CTEZ ? [tokenPool, cashPool] : [cashPool, tokenPool];
      const tokWithoutSlippage =
        (cashSold * 997 * aPool.toNumber()) / (bPool.toNumber() * 1000 + cashSold * 997) / 1e6;
      setMinBuyValue(Number(tokWithoutSlippage.toFixed(6)));
    } else {
      setMinBuyValue(0);
    }
  }, [cfmmStorage, formType, values.amount]);

  useEffect(() => {
    if (!userAddress) {
      setButtonText(BUTTON_TXT.CONNECT);
    } else if (values.amount) {
      setButtonText(BUTTON_TXT.SWAP);
    } else {
      setButtonText(BUTTON_TXT.ENTER_AMT);
    }
  }, [buttonText, userAddress, values.amount]);

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
            type="number"
            color={text4}
            bg={inputbg}
            value={values.amount}
            onChange={handleChange}
          />
          {getRightElement(formType === FORM_TYPE.CTEZ_TEZ ? TOKEN.CTez : TOKEN.Tez)}
        </InputGroup>
      </FormControl>

      <Flex justifyContent="center" mt={2}>
        <IconButton
          variant="ghost"
          size="sm"
          borderRadius="50%"
          aria-label="Swap Token"
          icon={<MdSwapVert />}
          onClick={() =>
            setFormType(formType === FORM_TYPE.CTEZ_TEZ ? FORM_TYPE.TEZ_CTEZ : FORM_TYPE.CTEZ_TEZ)
          }
        />
      </Flex>

      <FormControl id="to-input-amount" mt={-2} mb={6}>
        <FormLabel color={text2} fontSize="xs">
          To (estimate)
        </FormLabel>
        <InputGroup>
          <Input color={text4} bg={inputbg} value={minBuyValue} type="number" />
          {getRightElement(formType === FORM_TYPE.CTEZ_TEZ ? TOKEN.Tez : TOKEN.CTez)}
        </InputGroup>
      </FormControl>

      <Flex justifyContent="space-between">
        <Text fontSize="xs">Rate</Text>
        <Text color="#4E5D78" fontSize="xs">
          1 tez = {(1 / Number(baseStats?.currentPrice ?? 1)).toFixed(6)} ctez
        </Text>
      </Flex>
      <Flex justifyContent="space-between">
        <Text fontSize="xs">Price Impact</Text>
        <Text fontSize="xs">0.0000%</Text>
      </Flex>

      <Button
        width="100%"
        mt={4}
        p={6}
        type="submit"
        isLoading={isSubmitting}
        leftIcon={buttonText === BUTTON_TXT.CONNECT ? <MdAdd /> : undefined}
      >
        {buttonText}
      </Button>
    </form>
  );
};

export { Swap };
