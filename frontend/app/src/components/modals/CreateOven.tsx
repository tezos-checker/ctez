import {
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
  Text,
  useColorModeValue,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import { validateAddress } from '@taquito/utils';
import React, { useCallback, useEffect, useMemo } from 'react';
import { array, number, object, string } from 'yup';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useDelegates, useUserBalance } from '../../api/queries';
import { Depositor } from '../../interfaces';
import { create, cTezError } from '../../contracts/ctez';
import { useWallet } from '../../wallet/hooks';
import { logger } from '../../utils/logger';
import RadioCard from '../radio/RadioCard';
import Button from '../button/Button';
import DepositorsInput from '../input/DepositorsInput';
import { makeLastOvenIdSelector } from '../../hooks/reduxSelectors';
import { useAppSelector } from '../../redux/store';
import { useBakerSelect, useTxLoader } from '../../hooks/utilHooks';

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
  depositorOp: Depositor;
}

// TODO Refactor
const CreateOven: React.FC<ICreateOvenProps> = ({ isOpen, onClose }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);

  const { bakerSelect, setBakerSelect, options: bakerOptions, handleBakerCreate } = useBakerSelect(
    delegates,
  );

  const toast = useToast();
  const { t } = useTranslation(['common']);
  const options = ['Whitelist', 'Everyone'];
  const { data: balance } = useUserBalance(userAddress);
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const text4Text4 = useColorModeValue('text4', 'text4');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const text1 = useColorModeValue('text1', 'darkheading');
  const selectLastOvenId = useMemo(makeLastOvenIdSelector, []);
  const handleProcessing = useTxLoader();

  const lastOvenId = useAppSelector((state) => selectLastOvenId(state, userAddress));

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
    delegate: '',
    amount: 0,
    depositType: 'Whitelist',
    depositors: userAddress ? getDefaultDepositorList('') : [],
    // ! Unneccessary variable
    depositorOp: Depositor.whitelist,
  };

  const isInputValid = (inputValue: any) => {
    const exists = options?.find((option) => option === inputValue) !== undefined;
    const valid = inputValue.match(/^(tz1|tz2)([A-Za-z0-9]{33})$/);
    // TODO: show validation errors somewhere?
    return valid && !exists;
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
          lastOvenId,
          depositors,
          data.amount,
        );
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
          onClose();
        }
        handleProcessing(result);
      } catch (error) {
        logger.error(error);
        const errorText = cTezError[error?.data?.[1].with.int as number] || t('txFailed');
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

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader fontWeight="500" color={text1}>
            Create an Oven
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl w="100%" mb={2}>
              <FormLabel color={text2} fontWeight="500" fontSize="xs">
                Delegate
              </FormLabel>
              <CreatableSelect
                isClearable
                value={bakerSelect}
                options={bakerOptions}
                placeholder="Add a baker or Select from the list below"
                onChange={(ev) => {
                  if (ev) {
                    setBakerSelect(ev);
                    formik.setFieldValue('delegate', ev.value);
                  }
                }}
                onCreateOption={handleBakerCreate}
                isValidNewOption={isInputValid}
              />
            </FormControl>
            <FormControl w="100%" mb={2}>
              <FormLabel color={text2} fontWeight="500" fontSize="xs">
                Initial Deposit
              </FormLabel>
              <Input
                type="number"
                name="amount"
                id="amount"
                lang="en-US"
                color={text2}
                bg={inputbg}
                value={values.amount}
                onChange={handleChange}
              />
              <Text color={text4Text4} fontSize="xs" mt={1}>
                Balance: {balance?.xtz}{' '}
                <Text
                  as="span"
                  cursor="pointer"
                  color="#e35f5f"
                  onClick={() => formik.setFieldValue('amount', balance?.xtz)}
                >
                  (Max)
                </Text>
              </Text>
            </FormControl>

            <FormControl w="100%" mb={2}>
              <FormLabel color={text2} fontWeight="500" fontSize="xs">
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

            <DepositorsInput
              depositors={values.depositors}
              onChange={(dep) => formik.setFieldValue('depositors', dep)}
              outerBoxProps={{ mb: 2 }}
            />
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
