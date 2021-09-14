import { CreateOven } from './CreateOven';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { closeModal } from '../../redux/slices/UiSlice';
import { MODAL_NAMES } from '../../constants/modals';

const ModalContainer: React.FC = () => {
  const openedModal = useAppSelector((state) => state.ui.modal.open);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <CreateOven isOpen={openedModal === MODAL_NAMES.CREATE_OVEN} onClose={handleClose} />
    </>
  );
};

export default ModalContainer;
