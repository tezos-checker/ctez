import { combineReducers } from '@reduxjs/toolkit';
import { OvenActionsSlice } from './slices/OvenActions';

const rootReducer = combineReducers({
  ovenActions: OvenActionsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
