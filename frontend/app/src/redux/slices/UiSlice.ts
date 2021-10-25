import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MODAL_NAMES, TModalNames } from '../../constants/modals';

interface IUiSliceState {
  modal: {
    open: null | TModalNames;
    opHash: string | null;
  };
}

const initialState: IUiSliceState = {
  modal: {
    open: null,
    opHash: null,
  },
};

const UiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<TModalNames>) => {
      state.modal.open = action.payload;
    },
    closeModal: (state) => {
      state.modal.open = null;
      state.modal.opHash = null;
    },
    openTxSubmittedModal: (state, action: PayloadAction<{ opHash: string }>) => {
      state.modal.open = MODAL_NAMES.TX_SUBMITTED;
      state.modal.opHash = action.payload.opHash;
    },
  },
});

export const { openModal, closeModal, openTxSubmittedModal } = UiSlice.actions;

export default UiSlice.reducer;
