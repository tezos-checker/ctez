import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TModalNames } from '../../constants/modals';

interface IUiSliceState {
  modal: {
    open: null | TModalNames;
  };
}

const initialState: IUiSliceState = {
  modal: {
    open: null,
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
    },
  },
});

export const { openModal, closeModal } = UiSlice.actions;

export default UiSlice.reducer;
