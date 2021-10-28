import {
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { validateAddress } from '@taquito/utils';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import { useWallet } from '../../wallet/hooks';
import { IWithdrawForm } from '../../constants/oven-operations';
import { cTezError, withdraw } from '../../contracts/ctez';
import Button from '../button/Button';
import { TezIcon } from '../icons';
import { BUTTON_TXT } from '../../constants/swap';
import { AllOvenDatum } from '../../interfaces';
import { useOvenStats, useThemeColors, useTxLoader } from '../../hooks/utilHooks';

interface IWithdrawProps {
  isOpen: boolean;
  onClose: () => void;
  oven: AllOvenDatum | null;
}

const Withdraw: React.FC<IWithdrawProps> = ({ isOpen, onClose, oven }) => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const toast = useToast();
  const [cardbg, text2, text1, inputbg, text4Text4, maxColor] = useThemeColors([
    'tooltipbg',
    'text2',
    'text1',
    'inputbg',
    'text4',
    'maxColor',
  ]);
  const { stats } = useOvenStats(oven);
  const handleProcessing = useTxLoader();
  const initialValues: IWithdrawForm = {
    amount: 0,
    to: userAddress ?? '',
  };

  const getRightElement = useCallback(() => {
    return (
      <InputRightElement backgroundColor="transparent" w={24} color={text2}>
        <TezIcon height={28} width={28} />
        <Text fontWeight="500" mx={2}>
          tez
        </Text>
      </InputRightElement>
    );
  }, [text2]);
  const maxValue = (): number => stats?.withdrawableTez ?? 0;

  const validationSchema = object().shape({
    amount: number()
      .min(0.000001)
      .max(maxValue(), `${t('insufficientBalance')}`)
      .required(t('required')),
    to: string()
      .test({
        test: (value) => validateAddress(value) === 3,
        message: t('invalidAddress'),
      })
      .required(t('required')),
  });

  const handleFormSubmit = async (data: IWithdrawForm) => {
    if (oven?.key.id) {
      try {
        const result = await withdraw(Number(oven.key.id), data.amount, data.to);
        handleProcessing(result);
      } catch (error) {
        const errorText = cTezError[error.data[1].with.int as number] || t('txFailed');
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

  const { buttonText, errorList } = useMemo(() => {
    const errorListLocal = Object.values(errors);
    if (values.amount) {
      if (errorListLocal.length > 0) {
        return { buttonText: errorListLocal[0], errorList: errorListLocal };
      }

      return { buttonText: BUTTON_TXT.WITHDRAW, errorList: errorListLocal };
    }

    return { buttonText: BUTTON_TXT.ENTER_AMT, errorList: errorListLocal };
  }, [errors, values.amount]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader color={text1} fontWeight="500">
            Withdraw Tezos
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
              <Icon fontSize="2xl" color={text4Text4} as={MdInfo} m={1} />
              <Text color="gray.500" fontSize="xs" ml={2}>
                If the collateral ratio in a vault is observed at or below the emergency collateral
                ratio, the vault becomes available for liquidation.
              </Text>
            </Flex>
            <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
              <FormLabel color={text2} fontSize="xs">
                To
              </FormLabel>
              <Input
                readOnly
                name="to"
                color={text2}
                bg={inputbg}
                id="to"
                lang="en-US"
                value={values.to}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
              <FormLabel color={text2} fontSize="xs">
                Amount
              </FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  name="amount"
                  id="amount"
                  color={text2}
                  bg={inputbg}
                  lang="en-US"
                  value={values.amount}
                  onChange={handleChange}
                  placeholder="0.0"
                />
                {getRightElement()}
              </InputGroup>
              <Text color={text4Text4} fontSize="xs" mt={1}>
                Balance: {Math.abs(stats?.withdrawableTez ?? 0).toFixed(6)}{' '}
                <Text
                  as="span"
                  cursor="pointer"
                  color={maxColor}
                  onClick={() =>
                    formik.setFieldValue('amount', Math.abs(stats?.withdrawableTez ?? 0).toFixed(6))
                  }
                >
                  (Max)
                </Text>
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              w="100%"
              variant="outline"
              type="submit"
              disabled={isSubmitting || errorList.length > 0}
              isLoading={isSubmitting}
            >
              {buttonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default Withdraw;
