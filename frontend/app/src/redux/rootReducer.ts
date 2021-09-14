import { combineReducers } from '@reduxjs/toolkit';
import { OvenSlice } from './slices/OvenSlice';
import { StatsSlice } from './slices/StatsSlice';
import UiSlice from './slices/UiSlice';

const rootReducer = combineReducers({
  oven: OvenSlice.reducer,
  stats: StatsSlice.reducer,
  ui: UiSlice,
});

export default rootReducer;
