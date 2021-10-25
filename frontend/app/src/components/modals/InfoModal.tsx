import {
  Flex,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useColorModeValue,
} from '@chakra-ui/react';
import TxSubmitted from '../../assets/images/icons/tx-submitted.svg';
import Button from '../button/Button';
import { NETWORK } from '../../utils/globals';

interface IInfoModal {
  img?: string;
  open: boolean;
  onClose: () => void;
  opHash?: string | null;
}

const InfoModal: React.FC<IInfoModal> = (props) => {
  const text2 = useColorModeValue('text2', 'darkheading');

  return (
    <Modal isOpen={props.open} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody mb={2}>
          <Flex direction="column" alignItems="center">
            <Image width="82px" height="82px" src={TxSubmitted} mb={6} mt={8} />

            <Heading color={text2} fontSize="lg" textAlign="center" mb={2}>
              Transaction Submitted
            </Heading>

            <Button
              variant="ghost"
              color={text2}
              onClick={
                !props.opHash
                  ? undefined
                  : () => window.open(`https://${NETWORK}.tzkt.io/${props.opHash}`, '_blank')
              }
            >
              View On Tezos
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InfoModal;
