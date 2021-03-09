import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OvenSerializable } from '../../interfaces/ctez';

interface OvenActionState {
  oven: OvenSerializable | null;
  showActions: boolean;
}

const initialState: OvenActionState = {
  oven: null,
  showActions: false,
};

export const OvenActionsSlice = createSlice({
  name: 'ovenActions',
  initialState,
  reducers: {
    toggleActions: (state, action: PayloadAction<boolean>) => {
      state.showActions = action.payload;
    },
    setOven: (state, action: PayloadAction<OvenSerializable>) => {
      state.oven = action.payload;
    },
    clearOven: (state) => {
      state.oven = null;
      state.showActions = false;
    },
  },
});
