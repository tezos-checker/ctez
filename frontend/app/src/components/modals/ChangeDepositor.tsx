import {
  Box,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../button/Button';
import { Oven, OvenStorage } from '../../interfaces';
import RadioCard from '../radio/RadioCard';
import DepositorsInput from '../input/DepositorsInput';
import { trimAddress } from '../../utils/addressUtils';
import { useWallet } from '../../wallet/hooks';
import { addRemoveDepositorList, cTezError, enableDisableAnyDepositor } from '../../contracts/ctez';
import { logger } from '../../utils/logger';

interface IChangeDepositorProps {
  canAnyoneDeposit: boolean;
  oven: Oven;
  ovenStorage: OvenStorage | undefined;
  isOpen: boolean;
  onClose: () => void;
}

interface IDepositorItem {
  value: string;
  label: string;
  noDelete?: boolean;
}

const ChangeDepositor: React.FC<IChangeDepositorProps> = (props) => {
  const [{ pkh: userAddress }] = useWallet();
  const toast = useToast();
  const { t } = useTranslation(['common']);
  const text2 = useColorModeValue('text2', 'darkheading');
  const options = useMemo(() => ['Whitelist', 'Everyone'], []);
  const [depType, setDepType] = useState(options[0]);
  const [depositors, setDepositors] = useState<IDepositorItem[]>([]);

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'depositType',
    value: depType,
    onChange: setDepType,
  });
  const group = getRootProps();

  useEffect(() => {
    if (props.isOpen && depositors.length === 0 && props.ovenStorage) {
      setDepositors([
        {
          label: 'You',
          value: props.ovenStorage.admin,
          noDelete: true,
        },
        ...(!props.canAnyoneDeposit
          ? (props.ovenStorage.depositors as string[])?.map((dep) => ({
              label: trimAddress(dep),
              value: dep,
            }))
          : []),
      ]);
      setDepType(props.canAnyoneDeposit ? options[1] : options[0]);
    }
    if (!props.isOpen) {
      setDepositors([]);
    }
  }, [
    props.ovenStorage,
    props.oven,
    depositors.length,
    props.canAnyoneDeposit,
    props.isOpen,
    options,
  ]);

  const handleAllowAnyone = async () => {
    if (props.oven.address && userAddress) {
      try {
        const result = await enableDisableAnyDepositor(props.oven.address, true);
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
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

  const handleDepositorSubmit = async () => {
    if (props.oven.address && props.ovenStorage && userAddress) {
      console.log({
        address: props.oven.address,
        ovenStorage: props.ovenStorage,
        userAddress,
      });
      try {
        const userWhiteList = depositors
          .map((item: IDepositorItem) => item?.value ?? item)
          .filter((o) => o !== userAddress);
        const userDenyList = !props.canAnyoneDeposit
          ? (props.ovenStorage.depositors as string[]).filter((o) => !userWhiteList.includes(o))
          : undefined;
        const result = await addRemoveDepositorList(
          props.oven.address,
          props.ovenStorage,
          userWhiteList,
          userDenyList,
        );
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
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

  const handleConfirm = () => {
    if (depType === options[0]) {
      handleDepositorSubmit();
    } else {
      handleAllowAnyone();
    }
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="500">Change Depositor</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl w="100%" mb={4}>
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

          <Collapse in={depType === options[0]}>
            <DepositorsInput depositors={depositors} onChange={setDepositors} />
          </Collapse>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={props.onClose}>
            Cancel
          </Button>
          <Box w={2} />
          <Button onClick={handleConfirm}>Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChangeDepositor;
