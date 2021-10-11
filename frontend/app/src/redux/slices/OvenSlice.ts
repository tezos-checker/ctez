import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserOvenStats, OvenSerializable, Oven, AllOvenDatum } from '../../interfaces';

interface IAllOvenState {
  data: AllOvenDatum[];
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface OvenSliceState {
  oven: OvenSerializable | null;
  ovens: Oven[];
  extOvens: string[];
  allOvens: IAllOvenState;
  userOvenData: UserOvenStats;
  sortByOption: string | null;
}

const initialState: OvenSliceState = {
  oven: null,
  ovens: [],
  extOvens: [],
  allOvens: {
    data: [],
    isLoading: true,
    isSuccess: false,
    isError: false,
  },
  sortByOption: 'value',
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
    setAllOvenData: (state, action: PayloadAction<IAllOvenState>) => {
      state.allOvens = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortByOption = action.payload;
    },
  },
});

export const {
  setOven,
  setOvens,
  setExternalOvens,
  clearOven,
  setAllOvenData,
  setUserOvenData,
  setSortBy,
} = OvenSlice.actions;
export default OvenSlice.reducer;
