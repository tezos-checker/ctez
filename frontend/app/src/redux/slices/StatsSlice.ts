import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseStats } from '../../interfaces';

interface IStatsSlice {
  baseStats: BaseStats | null;
  transactionPending: boolean;
}

const initialState: IStatsSlice = {
  baseStats: null,
  transactionPending: false,
};

export const StatsSlice = createSlice({
  name: 'statsSlice',
  initialState,
  reducers: {
    setBaseStats: (state, action: PayloadAction<BaseStats>) => {
      state.baseStats = action.payload;
    },
    setPendingTransaction: (state, action: PayloadAction<boolean>) => {
      state.transactionPending = action.payload;
      return state;
    },
  },
});
