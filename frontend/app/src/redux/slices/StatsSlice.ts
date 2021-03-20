import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseStats } from '../../interfaces';

interface OvenSliceState {
  baseStats: BaseStats | null;
}

const initialState: OvenSliceState = {
  baseStats: null,
};

export const StatsSlice = createSlice({
  name: 'statsSlice',
  initialState,
  reducers: {
    setBaseStats: (state, action: PayloadAction<BaseStats>) => {
      state.baseStats = action.payload;
    },
  },
});
