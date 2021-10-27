import { combineReducers } from '@reduxjs/toolkit';
import OvenSlice from './slices/OvenSlice';
import UiSlice from './slices/UiSlice';
import TradeSlice from './slices/TradeSlice';

const rootReducer = combineReducers({
  oven: OvenSlice,
  ui: UiSlice,
  trade: TradeSlice,
});

export default rootReducer;
