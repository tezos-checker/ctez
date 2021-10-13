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
import { useCallback, useEffect, useState } from 'react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { validateAddress } from '@taquito/utils';
import { number, object, string } from 'yup';
import { useFormik } from 'formik';
import { useWallet } from '../../wallet/hooks';
import { IWithdrawForm } from '../../constants/oven-operations';
import { cTezError, withdraw } from '../../contracts/ctez';
import Button from '../button/Button';
import { CTezIcon } from '../icons';
import { BUTTON_TXT, TButtonText, TOKEN, TToken } from '../../constants/swap';
import { Oven } from '../../interfaces';

interface IWithdrawProps {
  isOpen: boolean;
  onClose: () => void;
  oven: Oven | undefined;
}

const Withdraw: React.FC<IWithdrawProps> = ({ isOpen, onClose, oven }) => {
  const { t } = useTranslation(['common']);
  const [buttonText, setButtonText] = useState<TButtonText>(BUTTON_TXT.ENTER_AMT);
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const text1 = useColorModeValue('text1', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const cardbg = useColorModeValue('bg3', 'darkblue');
  const [{ pkh: userAddress }] = useWallet();
  const toast = useToast();
  const initialValues: any = {
    amount: '',
    to: userAddress ?? '',
  };

  const getRightElement = useCallback(
    (token: TToken) => {
      return (
        <InputRightElement backgroundColor="transparent" w={24} color={text2}>
          <CTezIcon height={28} width={28} />
          <Text fontWeight="500" mx={2}>
            tez
          </Text>
        </InputRightElement>
      );
    },
    [text2],
  );

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
    if (oven?.ovenId) {
      try {
        const result = await withdraw(Number(oven.ovenId), data.amount, data.to);
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

  useEffect(() => {
    if (values.amount) {
      setButtonText(BUTTON_TXT.WITHDRAW);
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
            Withdraw Tezos
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
              <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
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

export default Withdraw;
