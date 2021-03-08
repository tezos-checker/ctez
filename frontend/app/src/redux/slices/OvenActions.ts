import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OvenActionState {
  ovenId: number | null;
  showActions: boolean;
}

const initialState: OvenActionState = {
  ovenId: null,
  showActions: false,
};

export const OvenActionsSlice = createSlice({
  name: 'ovenActions',
  initialState,
  reducers: {
    toggleActions: (state, action: PayloadAction<boolean>) => {
      state.showActions = action.payload;
    },
    setOvenId: (state, action: PayloadAction<number>) => {
      state.ovenId = action.payload;
    },
    clearOven: (state) => {
      state.ovenId = null;
      state.showActions = false;
    },
  },
});
