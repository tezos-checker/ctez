import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { validateAddress } from '@taquito/utils';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import { BUTTON_TXT, TButtonText, TOKEN, TToken } from '../../constants/swap';
import { cTezError, liquidate } from '../../contracts/ctez';
import Button from '../button/Button';
import { AllOvenDatum } from '../../interfaces';
import { useTxLoader } from '../../hooks/utilHooks';
import { useWallet } from '../../wallet/hooks';

interface LiquidateForm {
  ovenOwner: string;
  amount: number;
  to: string;
}
interface ILiquidateProps {
  isOpen: boolean;
  onClose: () => void;
  oven: AllOvenDatum | null;
}

const LiquidateOven: React.FC<ILiquidateProps> = ({ isOpen, onClose, oven }) => {
  const toast = useToast();
  const [buttonText, setButtonText] = useState<TButtonText>(BUTTON_TXT.ENTER_AMT);
  const text1 = useColorModeValue('text1', 'darkheading');
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const handleProcessing = useTxLoader();
  const [{ pkh: userAddress }] = useWallet();

  const { t } = useTranslation(['common']);
  const initialValues: any = {
    ovenOwner: oven?.key.owner ?? '',
    amount: '',
    to: userAddress ?? '',
  };

  const validationSchema = object().shape({
    amount: number().min(0.000001).required(t('required')),
    to: string()
      .test({
        test: (value) => validateAddress(value) === 3,
        message: t('invalidAddress'),
      })
      .required(t('required')),
  });

  const handleFormSubmit = async (data: LiquidateForm) => {
    if (oven?.key.id) {
      try {
        const result = await liquidate(
          Number(oven?.key.id),
          oven.key.owner,
          Number(data.amount),
          data.to,
        );
        handleProcessing(result);
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader color={text1} fontWeight="500">
            Liquidate Oven
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mt={2} mb={6} w="100%">
              <FormLabel color={text2} fontSize="xs">
                Oven Owner
              </FormLabel>
              <Input
                readOnly
                name="ovenOwner"
                color={text4}
                bg={inputbg}
                id="ovenOwner"
                value={values.ovenOwner}
              />
            </FormControl>
            <FormControl mt={2} mb={6} w="100%">
              <FormLabel color={text2} fontSize="xs">
                To
              </FormLabel>
              <InputGroup>
                <Input
                  name="to"
                  id="to"
                  color={text4}
                  bg={inputbg}
                  value={values.to}
                  onChange={handleChange}
                />
              </InputGroup>
            </FormControl>
            <FormControl mt={2} mb={6} w="100%">
              <FormLabel color={text2} fontSize="xs">
                Amount
              </FormLabel>
              <InputGroup>
                <Input
                  name="amount"
                  id="amount"
                  color={text4}
                  bg={inputbg}
                  value={values.amount}
                  onChange={handleChange}
                />
              </InputGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button w="100%" variant="outline" type="submit">
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default LiquidateOven;
