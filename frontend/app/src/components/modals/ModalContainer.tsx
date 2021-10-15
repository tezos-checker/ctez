import CreateOven from './CreateOven';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { closeModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';
import TrackOven from './TrackOven';
import { useWallet } from '../../wallet/hooks';
import InfoModal from './InfoModal';

const ModalContainer: React.FC = () => {
  const { open, opHash } = useAppSelector((state) => state.ui.modal);
  const dispatch = useAppDispatch();
  const [{ pkh: userAddress }] = useWallet();

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <>
      {userAddress && (
        <CreateOven isOpen={open === MODAL_NAMES.CREATE_OVEN} onClose={handleClose} />
      )}
      {userAddress && <TrackOven isOpen={open === MODAL_NAMES.TRACK_OVEN} onClose={handleClose} />}
      <InfoModal open={open === MODAL_NAMES.TX_SUBMITTED} onClose={handleClose} opHash={opHash} />
    </>
  );
};

export default ModalContainer;
