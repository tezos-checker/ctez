import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_DEALINE, DEFAULT_SLIPPAGE } from '../../utils/globals';

interface ITradeSliceState {
  slippage: number;
  deadline: number;
}

const initialState: ITradeSliceState = {
  slippage: DEFAULT_SLIPPAGE,
  deadline: DEFAULT_DEALINE,
};

const TradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    setSlippage: (state, action: PayloadAction<number>) => {
      state.slippage = action.payload;
    },
    setDeadline: (state, action: PayloadAction<number>) => {
      state.deadline = action.payload;
    },
  },
});

export const { setSlippage, setDeadline } = TradeSlice.actions;
export default TradeSlice.reducer;
