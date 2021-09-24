import {
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { validateAddress } from '@taquito/utils';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import { useParams } from 'react-router-dom';
import { useWallet } from '../../wallet/hooks';
import { IWithdrawForm } from '../../constants/oven-operations';
import { cTezError, withdraw } from '../../contracts/ctez';
import Button from '../button/Button';

const Withdraw: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { colorMode } = useColorMode();
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const cardbg = useColorModeValue('bg3', 'darkblue');
  const [{ pkh: userAddress }] = useWallet();
  const toast = useToast();
  const { ovenId } = useParams<{ ovenId: string }>();
  const initialValues: any = {
    amount: '',
    to: userAddress ?? '',
  };

  const validationSchema = object().shape({
    amount: number().min(0.1).required(t('required')),
    to: string()
      .test({
        test: (value) => validateAddress(value) === 3,
        message: t('invalidAddress'),
      })
      .required(t('required')),
  });

  const handleFormSubmit = async (data: IWithdrawForm) => {
    if (ovenId) {
      try {
        const result = await withdraw(Number(ovenId), data.amount, data.to);
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
      } catch (error) {
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
      <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
        <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
        <Text color="gray.500" fontSize="xs" ml={2}>
          By adding liquidity you'll earn 0.2% of all trades on this pair proportional to your share
          of the pool. Fees are added to the
        </Text>
      </Flex>

      <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
        <FormLabel color={text2} fontSize="xs">
          Withdrawl To
        </FormLabel>
        <Input
          readOnly
          name="to"
          color={text4}
          bg={inputbg}
          id="to"
          value={values.to}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
        <FormLabel color={text2} fontSize="xs">
          Amount
        </FormLabel>
        <Input
          type="number"
          name="amount"
          id="amount"
          color={text4}
          bg={inputbg}
          value={values.amount}
          onChange={handleChange}
        />
      </FormControl>

      <Button w="100%" variant="outline">
        Withdraw tez
      </Button>
    </form>
  );
};

export default Withdraw;
