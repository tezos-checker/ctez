import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useColorMode,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { validateAddress } from '@taquito/utils';
import { useCallback, useEffect, useState } from 'react';
import { array, number, object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDelegates } from '../../api/queries';
import { Depositor } from '../../interfaces';
import { create, cTezError } from '../../contracts/ctez';
import { useWallet } from '../../wallet/hooks';
import { logger } from '../../utils/logger';
import RadioCard from '../radio/RadioCard';
import Button from '../button/Button';

interface ICreateOvenProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IDepositorItem {
  value: string;
  label: string;
  noDelete?: boolean;
}

interface ICreateVaultForm {
  delegate: string;
  amount: number;
  depositType: 'Whitelist' | 'Everyone';
  depositors: IDepositorItem[];
  depositorInput?: string;
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
  const { colorMode } = useColorMode();

  const validationSchema = object().shape({
    delegate: string()
      .test({
        test: (value) => validateAddress(value) === 3,
      })
      .required(t('required')),
    amount: number().optional(),
    depositors: array()
      .test({
        test: (value) => {
          return (
            value?.reduce((acc, item: any) => {
              return acc && validateAddress(item?.value ?? item) === 3;
            }, true) ?? false
          );
        },
      })
      .required(t('required')),
  });

  const getDefaultDepositorList = useCallback(
    (_delegate: string) =>
      _delegate !== ''
        ? [
            {
              value: userAddress!,
              label: 'You',
              noDelete: true,
            },
            {
              value: _delegate,
              label: 'Delegate',
            },
          ]
        : [
            {
              value: userAddress!,
              label: 'You',
              noDelete: true,
            },
          ],
    [userAddress],
  );

  const initialValues: ICreateVaultForm = {
    delegate,
    amount: 0,
    depositType: 'Whitelist',
    depositors: userAddress ? getDefaultDepositorList(delegate) : [],
    depositorInput: '',
    depositorOp: Depositor.whitelist,
  };

  const handleFormSubmit = async (data: ICreateVaultForm) => {
    if (userAddress) {
      try {
        const depositors =
          data.depositors.length > 0 && data.depositType === 'Whitelist'
            ? data.depositors
                .map((item: IDepositorItem) => item?.value ?? item)
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

  useEffect(() => {
    formik.setFieldValue('depositors', userAddress ? getDefaultDepositorList(values.delegate) : []);
  }, [userAddress, values.delegate]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'depositType',
    defaultValue: 'Whitelist',
    onChange: (value) => formik.setFieldValue('depositType', value),
  });
  const group = getRootProps();

  const handleDepositorInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target;
    const depositors = value.split(' ');
    if (depositors.length > 1) {
      formik.setFieldValue('depositors', [...values.depositors, depositors[0]]);
      formik.setFieldValue('depositorInput', depositors[1]);
    } else {
      formik.setFieldValue('depositorInput', depositors[0]);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader fontWeight="500" color={colorMode === 'light' ? 'text1' : 'darkheading'}>
            Create an Oven
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl w="100%" mb={2}>
              <FormLabel
                color={colorMode === 'light' ? 'text2' : 'darkheading'}
                fontWeight="500"
                fontSize="xs"
              >
                Delegate
              </FormLabel>

              <Select
                placeholder={t('delegatePlaceholder')}
                value={values.delegate}
                color={colorMode === 'light' ? 'text4' : 'darkheading'}
                bg={colorMode === 'light' ? 'darkheading' : 'textboxbg'}
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
              <FormLabel
                color={colorMode === 'light' ? 'text2' : 'darkheading'}
                fontWeight="500"
                fontSize="xs"
              >
                Initial Deposit
              </FormLabel>
              <Input
                type="number"
                name="amount"
                id="amount"
                color={colorMode === 'light' ? 'text4' : 'darkheading'}
                bg={colorMode === 'light' ? 'darkheading' : 'textboxbg'}
                value={values.amount}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl w="100%" mb={2}>
              <FormLabel
                color={colorMode === 'light' ? 'text2' : 'darkheading'}
                fontWeight="500"
                fontSize="xs"
              >
                Who can Deposit?
              </FormLabel>
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
              <FormLabel
                fontSize="xs"
                color={colorMode === 'light' ? 'text2' : 'darkheading'}
                fontWeight="500"
              >
                Authorised Deposters
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" w="" left={2}>
                  <Box px={2} boxShadow="xs">
                    {values.depositors[0]?.label}
                    {values.depositors?.length > 1 ? ` + ${values.depositors?.length - 1}` : ''}
                  </Box>
                </InputLeftElement>
                <Input
                  name="depositorInput"
                  id="depositorInput"
                  color={colorMode === 'light' ? 'text4' : 'darkheading'}
                  bg={colorMode === 'light' ? 'darkheading' : 'textboxbg'}
                  pl={values.depositors.length > 1 ? '84px' : '56px'}
                  value={values.depositorInput}
                  onChange={handleDepositorInput}
                />
              </InputGroup>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button w="100%" type="submit">
              Create Oven
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default CreateOven;
