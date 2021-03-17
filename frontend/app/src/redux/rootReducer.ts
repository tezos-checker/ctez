import { combineReducers } from '@reduxjs/toolkit';
import { OvenSlice } from './slices/OvenSlice';
import { StatsSlice } from './slices/StatsSlice';

const rootReducer = combineReducers({
  oven: OvenSlice.reducer,
  stats: StatsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
