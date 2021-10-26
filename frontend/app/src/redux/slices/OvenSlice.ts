import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserOvenStats, OvenSerializable, AllOvenDatum } from '../../interfaces';

interface IAllOvenState {
  data: AllOvenDatum[];
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface OvenSliceState {
  oven: OvenSerializable | null;
  extOvens: string[];
  allOvens: IAllOvenState;
  userOvenData: UserOvenStats;
  sortByOption: string | null;
}

const initialState: OvenSliceState = {
  oven: null,
  extOvens: [],
  allOvens: {
    data: [],
    isLoading: true,
    isSuccess: false,
    isError: false,
  },
  sortByOption: 'Oven Balance',
  userOvenData: { xtz: 0, ctez: 0, totalOvens: 0 },
};

export const OvenSlice = createSlice({
  name: 'oven',
  initialState,
  reducers: {
    setExternalOvens: (state, action: PayloadAction<string[]>) => {
      state.extOvens = action.payload;
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

export const { setExternalOvens, setAllOvenData, setUserOvenData, setSortBy } = OvenSlice.actions;
export default OvenSlice.reducer;
