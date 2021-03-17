import { combineReducers } from '@reduxjs/toolkit';
import { OvenSlice } from './slices/OvenSlice';

const rootReducer = combineReducers({
  ovenActions: OvenSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
