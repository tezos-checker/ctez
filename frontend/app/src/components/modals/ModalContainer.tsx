import CreateOven from './CreateOven';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { closeModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';
import TrackOven from './TrackOven';

const ModalContainer: React.FC = () => {
  const openedModal = useAppSelector((state) => state.ui.modal.open);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <CreateOven isOpen={openedModal === MODAL_NAMES.CREATE_OVEN} onClose={handleClose} />
      <TrackOven isOpen={openedModal === MODAL_NAMES.TRACK_OVEN} onClose={handleClose} />
    </>
  );
};

export default ModalContainer;
