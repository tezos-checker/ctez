import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { validateAddress } from '@taquito/utils';
import { useEffect, useState } from 'react';
import { array, number, object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDelegates } from '../../api/queries';
import { Depositor } from '../../interfaces';
import { create, cTezError } from '../../contracts/ctez';
import { useWallet } from '../../wallet/hooks';
import { logger } from '../../utils/logger';
import RadioCard from '../radio/RadioCard';

interface ICreateOvenProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ICreateVaultForm {
  delegate: string;
  amount: number;
  depositType: 'Whitelist' | 'Everyone';
  depositors: string;
  depositorOp: Depositor;
}

// TODO Refactor
const CreateOven: React.FC<ICreateOvenProps> = ({ isOpen, onClose }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);
  const [delegate, setDelegate] = useState('');
  const toast = useToast();
  const { t } = useTranslation(['common']);
  const options = ['Whitelist', 'Everyone'];

  const validationSchema = object().shape({
    delegate: string()
      .test({
        test: (value) => validateAddress(value) === 3,
      })
      .required(t('required')),
    amount: number().optional(),
    depositors: string()
      .test({
        test: (value) => {
          return value?.split(', ').every((item) => validateAddress(item) === 3) ?? false;
        },
      })
      .required(t('required')),
  });

  const opSelectionList = [
    {
      label: t(Depositor.whitelist),
      value: Depositor.whitelist,
    },
    {
      label: t(Depositor.any),
      value: Depositor.any,
    },
  ];

  const defaultDepositorList: string[] = [
    userAddress,
    delegate !== '' ? delegate : undefined,
  ].filter((x): x is string => x !== undefined);

  const [initialValues, setInitialValues] = useState<ICreateVaultForm>({
    delegate,
    amount: 0,
    depositors: (userAddress ? defaultDepositorList : []).join(', '),
    depositType: 'Whitelist',
    depositorOp: Depositor.whitelist,
  });

  useEffect(() => {
    const newState: ICreateVaultForm = {
      ...initialValues,
      delegate,
      depositors: (userAddress ? defaultDepositorList : []).join(', '),
    };
    setInitialValues(newState);
  }, [userAddress, delegate]);

  const handleFormSubmit = async (data: ICreateVaultForm) => {
    if (userAddress) {
      try {
        const depositors =
          data.depositors.split(', ').length > 0 && data.depositType === 'Whitelist'
            ? data.depositors
                .split(', ')
                .map((item: string) => item)
                .filter((o) => o !== userAddress)
            : undefined;
        const result = await create(
          userAddress,
          data.delegate,
          data.depositType === 'Whitelist' ? Depositor.whitelist : Depositor.any,
          depositors,
          data.amount,
        );
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

  const { values, handleChange, handleSubmit, ...formik } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'depositType',
    defaultValue: 'Whitelist',
    onChange: (value) => formik.setFieldValue('depositType', value),
  });
  const group = getRootProps();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader>Create an Oven</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl w="100%" mb={2}>
              <FormLabel fontSize="xs">Delegate</FormLabel>

              <Select
                placeholder={t('delegatePlaceholder')}
                value={values.delegate}
                onChange={(ev) => {
                  formik.setFieldValue('delegate', ev.target.value);
                }}
              >
                {delegates?.map((x) => (
                  <option key={x.address} value={x.address}>
                    {x.address}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl w="100%" mb={2}>
              <FormLabel fontSize="xs">Initial Deposit</FormLabel>
              <Input
                type="number"
                name="amount"
                id="amount"
                value={values.amount}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl w="100%" mb={2}>
              <FormLabel fontSize="xs">Who can Deposit?</FormLabel>
              <Flex {...group} w="100%" justifyContent="space-between">
                {options.map((value) => {
                  const radio = getRadioProps({ value });
                  return (
                    <RadioCard key={value} {...radio}>
                      {value}
                    </RadioCard>
                  );
                })}
              </Flex>
            </FormControl>

            <FormControl w="100%" mb={2}>
              <FormLabel fontSize="xs">Authorised Deposters</FormLabel>
              <Input
                name="depositors"
                id="depositors"
                value={values.depositors}
                onChange={handleChange}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" w="100%" type="submit">
              Create Oven
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default CreateOven;
