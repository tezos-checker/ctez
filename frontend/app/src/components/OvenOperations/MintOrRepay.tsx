import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
// import BigNumber from 'bignumber.js';
import { number, object } from 'yup';
import { useFormik } from 'formik';
import { useMemo } from 'react';
import { useAppSelector } from '../../redux/store';
// import { getOvenMaxCtez } from '../../utils/ovenUtils';
import { isMonthFromLiquidation } from '../../api/contracts';
import { IMintRepayForm } from '../../constants/oven-operations';
import { cTezError, mintOrBurn } from '../../contracts/ctez';
import { logger } from '../../utils/logger';

interface IMintOrRepayProps {
  type: 'mint' | 'repay';
}

const MintOrRepay: React.FC<IMintOrRepayProps> = ({ type }) => {
  const { t } = useTranslation(['common']);
  const toast = useToast();

  const oven = useAppSelector((state) => state.oven.oven);
  const { ovenId, tez_balance, ctez_outstanding } = useMemo(
    () =>
      oven ?? {
        ovenId: 0,
        tez_balance: '0',
        ctez_outstanding: '0',
      },
    [oven],
  );

  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);
  const drift = useAppSelector((state) => state.stats.baseStats?.drift);
  // const { max, remaining } = currentTarget
  //   ? getOvenMaxCtez(tez_balance, ctez_outstanding, currentTarget)
  //   : { max: 0, remaining: 0 };

  // const outStandingCtez = new BigNumber(ctez_outstanding).shiftedBy(-6).toNumber() ?? 0;
  // const maxMintableCtez = max < 0 ? 0 : max;
  // const remainingMintableCtez = remaining < 0 ? 0 : remaining;
  const validationSchema = object().shape({
    amount: number()
      .min(0.000001)
      .test({
        test: (value) => {
          if (
            value !== undefined &&
            drift !== undefined &&
            currentTarget !== undefined &&
            type === 'mint'
          ) {
            const newOutstanding = Number(ctez_outstanding) + value * 1e6;
            const tez = Number(tez_balance);
            const result = isMonthFromLiquidation(newOutstanding, currentTarget, tez, drift);
            return !result;
          }
          if (value && type === 'repay') {
            const ctezOutstanding = Number(ctez_outstanding) / 1e6;
            return value <= ctezOutstanding;
          }
          return false;
        },
        message: t(type === 'mint' ? 'excessiveMintingError' : 'excessiveBurnError'),
      })
      .required(t('required')),
  });
  const initialValues: any = {
    amount: '',
  };

  const handleFormSubmit = async (data: IMintRepayForm) => {
    if (ovenId) {
      try {
        const amount = type === 'repay' ? -data.amount : data.amount;
        const result = await mintOrBurn(ovenId, amount);
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
      } catch (error) {
        logger.warn(error);
        const errorText = cTezError[error.data[1].with.int as number] || t('txFailed');
        toast({
          description: errorText,
          status: 'error',
        });
      }
    }
  };

  const { values, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });

  return (
    <form onSubmit={handleSubmit}>
      <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor="gray.50">
        <Icon fontSize="2xl" as={MdInfo} m={1} />
        <Text fontSize="xs" ml={2}>
          By adding liquidity you'll earn 0.2% of all trades on this pair proportional to your share
          of the pool. Fees are added to the
        </Text>
      </Flex>

      <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
        <FormLabel fontSize="xs">{type === 'mint' ? 'Mint Ctez' : 'Repay'}</FormLabel>
        <Input
          type="number"
          name="amount"
          id="amount"
          value={values.amount}
          onChange={handleChange}
        />
      </FormControl>

      <Button w="100%" variant="outline" type="submit">
        {type === 'mint' ? 'Mint Ctez' : 'Repay'}
      </Button>
    </form>
  );
};

export default MintOrRepay;
