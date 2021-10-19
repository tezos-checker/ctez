import {
  FormControl,
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
import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { number, object } from 'yup';
import { useFormik } from 'formik';

import { IDepositForm } from '../../constants/oven-operations';
import { BUTTON_TXT, TButtonText, TOKEN, TToken } from '../../constants/swap';
import { cTezError, deposit } from '../../contracts/ctez';
import { logger } from '../../utils/logger';

import Button from '../button/Button';
import { CTezIcon, TezIcon } from '../icons';
import { AllOvenDatum } from '../../interfaces';
import { useTxLoader } from '../../hooks/utilHooks';

interface IDepositProps {
  isOpen: boolean;
  onClose: () => void;
  oven: AllOvenDatum | null;
}

const Deposit: React.FC<IDepositProps> = ({ isOpen, onClose, oven }) => {
  const toast = useToast();
  const [buttonText, setButtonText] = useState<TButtonText>(BUTTON_TXT.ENTER_AMT);
  const text1 = useColorModeValue('text1', 'darkheading');
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const handleProcessing = useTxLoader();

  const getRightElement = useCallback(
    (token: TToken) => {
      return (
        <InputRightElement backgroundColor="transparent" w={24} color={text2}>
          <TezIcon height={28} width={28} />
          <Text fontWeight="500" mx={2}>
            tez
          </Text>
        </InputRightElement>
      );
    },
    [text2],
  );

  const { t } = useTranslation(['common']);
  const initialValues: any = {
    amount: '',
  };

  const validationSchema = object().shape({
    amount: number().min(0.000001).required(t('required')),
  });

  const handleFormSubmit = async (data: IDepositForm) => {
    if (oven?.value.address) {
      try {
        const result = await deposit(oven.value.address, data.amount);
        handleProcessing(result);
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
      } catch (error) {
        logger.error(error);
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

  useEffect(() => {
    if (values.amount) {
      setButtonText(BUTTON_TXT.DEPOSIT);
    } else {
      setButtonText(BUTTON_TXT.ENTER_AMT);
    }
  }, [buttonText, values.amount]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader color={text1} fontWeight="500">
            Deposit Tezos
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
              <InputGroup>
                <Input
                  type="number"
                  name="amount"
                  id="amount"
                  color={text4}
                  bg={inputbg}
                  value={values.amount}
                  onChange={handleChange}
                  placeholder="0.0"
                />
                {getRightElement(TOKEN.Tez)}
              </InputGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button w="100%" variant="outline" type="submit">
              {buttonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default Deposit;
