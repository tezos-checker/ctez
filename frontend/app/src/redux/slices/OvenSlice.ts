import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserOvenStats, OvenSerializable, Oven } from '../../interfaces';

interface OvenSliceState {
  oven: OvenSerializable | null;
  ovens: Oven[];
  extOvens: string[];
  userOvenData: UserOvenStats;
}

const initialState: OvenSliceState = {
  oven: null,
  ovens: [],
  extOvens: [],
  userOvenData: { xtz: 0, ctez: 0, totalOvens: 0 },
};

export const OvenSlice = createSlice({
  name: 'oven',
  initialState,
  reducers: {
    setOven: (state, action: PayloadAction<OvenSerializable>) => {
      state.oven = action.payload;
    },
    setOvens: (state, action: PayloadAction<Oven[]>) => {
      state.ovens = action.payload;
    },
    setExternalOvens: (state, action: PayloadAction<string[]>) => {
      state.extOvens = action.payload;
    },
    clearOven: (state) => {
      state.oven = null;
      state.ovens = [];
    },
    setUserOvenData: (state, action: PayloadAction<UserOvenStats>) => {
      state.userOvenData = action.payload;
    },
  },
});

export const {
  setOven,
  setOvens,
  setExternalOvens,
  clearOven,
  setUserOvenData,
} = OvenSlice.actions;
export default OvenSlice.reducer;
