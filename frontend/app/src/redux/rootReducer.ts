import { combineReducers } from '@reduxjs/toolkit';
import OvenSlice from './slices/OvenSlice';
import StatsSlice from './slices/StatsSlice';
import UiSlice from './slices/UiSlice';
import TradeSlice from './slices/TradeSlice';

const rootReducer = combineReducers({
  oven: OvenSlice,
  stats: StatsSlice,
  ui: UiSlice,
  trade: TradeSlice,
});

export default rootReducer;
