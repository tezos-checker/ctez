import { combineReducers } from '@reduxjs/toolkit';
import OvenSlice from './slices/OvenSlice';
import StatsSlice from './slices/StatsSlice';
import UiSlice from './slices/UiSlice';

const rootReducer = combineReducers({
  oven: OvenSlice,
  stats: StatsSlice,
  ui: UiSlice,
});

export default rootReducer;
