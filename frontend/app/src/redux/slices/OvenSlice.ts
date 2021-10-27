import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OvenSliceState {
  extOvens: string[];
  sortByOption: string | null;
}

const initialState: OvenSliceState = {
  extOvens: [],
  sortByOption: 'value',
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
  },
});

export const { setExternalOvens, setSortBy } = OvenSlice.actions;
export default OvenSlice.reducer;
