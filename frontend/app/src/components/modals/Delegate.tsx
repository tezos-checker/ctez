import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useDelegates } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';
import Button from '../button/Button';
import { cTezError, delegate } from '../../contracts/ctez';
import { Oven } from '../../interfaces';

interface IDelegateProps {
  oven: Oven;
  isOpen: boolean;
  onClose: () => void;
}

const Delegate: React.FC<IDelegateProps> = (props) => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);
  const toast = useToast();
  const [delegator, setDelegator] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDelegator(props.oven.baker ?? '');
  }, [props.oven]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await delegate(props.oven.address, delegator);
      if (result) {
        toast({
          description: t('txSubmitted'),
          status: 'success',
        });
      }
    } catch (error) {
      const errorText = cTezError[error?.data?.[1].with.int as number] || t('txFailed');
      toast({
        description: errorText,
        status: 'error',
      });
    } finally {
      setLoading(false);
      props.onClose();
    }
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontWeight="500">Change Baker</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Select
            placeholder={t('delegatePlaceholder')}
            value={delegator}
            onChange={(ev) => {
              setDelegator(ev.target.value);
            }}
          >
            {delegates?.map((x) => (
              <option key={x.address} value={x.address}>
                {x.address}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={props.onClose}>
            Cancel
          </Button>
          <Box w={2} />
          <Button onClick={handleConfirm} isLoading={loading}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Delegate;
