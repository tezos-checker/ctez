import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OvenSliceState {
  extOvens: string[];
  sortByOption: string | null;
  removeOven: string | null;
}

const initialState: OvenSliceState = {
  extOvens: [],
  sortByOption: 'Oven Balance',
  removeOven: '',
};

export const OvenSlice = createSlice({
  name: 'oven',
  initialState,
  reducers: {
    setExternalOvens: (state, action: PayloadAction<string[]>) => {
      state.extOvens = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortByOption = action.payload;
    },
    setRemoveOven: (state, action: PayloadAction<string>) => {
      state.removeOven = action.payload;
    },
  },
});

export const { setExternalOvens, setSortBy, setRemoveOven } = OvenSlice.actions;
export default OvenSlice.reducer;
