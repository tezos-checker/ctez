import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Oven } from '../../interfaces/ctez';

interface OvenActionState {
  oven: Oven | null;
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
    setOven: (state, action: PayloadAction<Oven>) => {
      state.oven = action.payload;
    },
    clearOven: (state) => {
      state.oven = null;
      state.showActions = false;
    },
  },
});
