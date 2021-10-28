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
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { validateAddress } from '@taquito/utils';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import { cTezError, liquidate } from '../../contracts/ctez';
import Button from '../button/Button';
import { AllOvenDatum } from '../../interfaces';
import { useThemeColors, useTxLoader } from '../../hooks/utilHooks';
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
  const [text1, text2, inputbg] = useThemeColors(['text1', 'text2', 'inputbg']);
  const handleProcessing = useTxLoader();
  const [{ pkh: userAddress }] = useWallet();

  const { t } = useTranslation(['common']);
  const initialValues: LiquidateForm = {
    ovenOwner: oven?.key.owner ?? '',
    amount: 0,
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
                color={text2}
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
                  color={text2}
                  bg={inputbg}
                  value={values.to}
                  onChange={handleChange}
                  lang="en-US"
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
                  color={text2}
                  bg={inputbg}
                  lang="en-US"
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
