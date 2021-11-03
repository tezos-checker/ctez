import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OvenSliceState {
  extOvens: string[];
  sortByOption: string | null;
  removeOven: string | null;
  searchValue: string | null;
  clear: boolean;
}

const initialState: OvenSliceState = {
  extOvens: [],
  sortByOption: 'Oven Balance',
  removeOven: '',
  searchValue: '',
  clear: false,
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
    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
    },
    setClear: (state, action: PayloadAction<boolean>) => {
      state.clear = action.payload;
    },
  },
});

export const {
  setExternalOvens,
  setSortBy,
  setRemoveOven,
  setSearchValue,
  setClear,
} = OvenSlice.actions;
export default OvenSlice.reducer;
