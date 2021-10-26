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
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { number, object } from 'yup';
import { useFormik } from 'formik';
import { useCallback, useMemo } from 'react';
import { IMintRepayForm } from '../../constants/oven-operations';
import { cTezError, mintOrBurn } from '../../contracts/ctez';
import { logger } from '../../utils/logger';
import Button from '../button/Button';
import { BUTTON_TXT } from '../../constants/swap';
import { CTezIcon } from '../icons';
import { AllOvenDatum } from '../../interfaces';
import { useOvenStats, useTxLoader } from '../../hooks/utilHooks';
import { useUserBalance } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';

interface IBurnProps {
  isOpen: boolean;
  onClose: () => void;
  oven: AllOvenDatum | null;
}

const Burn: React.FC<IBurnProps> = ({ isOpen, onClose, oven }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { t } = useTranslation(['common']);
  const toast = useToast();
  const text2 = useColorModeValue('text2', 'darkheading');
  const text1 = useColorModeValue('text1', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const cardbg = useColorModeValue('bg3', 'darkblue');
  const text4Text4 = useColorModeValue('text4', 'text4');
  const handleProcessing = useTxLoader();
  const { stats } = useOvenStats(oven);
  const { data: userBalance } = useUserBalance(userAddress);

  const getRightElement = useCallback(() => {
    return (
      <InputRightElement backgroundColor="transparent" w={24} color={text2}>
        <CTezIcon height={28} width={28} />
        <Text fontWeight="500" mx={2}>
          ctez
        </Text>
      </InputRightElement>
    );
  }, [text2]);

  const { ctez_outstanding } = useMemo(
    () =>
      oven?.value ?? {
        ctez_outstanding: '0',
      },
    [oven],
  );
  const maxValue = (): number => stats?.outStandingCtez ?? 0;

  const validationSchema = object().shape({
    amount: number()
      .min(0.000001)
      .max(maxValue(), `${t('insufficientBalance')}`)
      .test({
        test: (value) => {
          if (value) {
            const ctezOutstanding = Number(ctez_outstanding) / 1e6;
            return value <= ctezOutstanding;
          }
          return false;
        },
        message: t('excessiveBurnError'),
      })
      .required(t('required')),
  });
  const initialValues: any = {
    amount: '',
  };

  const handleFormSubmit = async (data: IMintRepayForm) => {
    if (oven?.key.id) {
      try {
        const amount = -data.amount;
        const result = await mintOrBurn(Number(oven.key.id), amount);
        handleProcessing(result);
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

      return { buttonText: BUTTON_TXT.BURN, errorList: errorListLocal };
    }

    return { buttonText: BUTTON_TXT.ENTER_AMT, errorList: errorListLocal };
  }, [errors, values.amount]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader color={text1} fontWeight="500">
            Burn ctez
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
              <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
              <Text fontSize="xs" ml={2}>
                If the collateral ratio in a vault is observed at or below the emergency collateral
                ratio, the vault becomes available for liquidation.
              </Text>
            </Flex>
            <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
              <FormLabel fontWeight="500" color={text2} fontSize="xs">
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
                Balance: {Math.min(userBalance?.ctez ?? 0, stats?.outStandingCtez ?? 0)}{' '}
                <Text
                  as="span"
                  cursor="pointer"
                  color="#e35f5f"
                  onClick={() =>
                    formik.setFieldValue(
                      'amount',
                      Math.min(userBalance?.ctez ?? 0, stats?.outStandingCtez ?? 0),
                    )
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
            >
              {buttonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default Burn;
