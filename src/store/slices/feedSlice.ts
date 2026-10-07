import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { hydrate } from '../hydrate';

export interface FeedState {
  /** Persisted card order (ids). Items not listed keep natural order after listed ones. */
  order: string[];
  lastUpdated: number | null;
  /** Items that arrived through a live refresh since the user last acknowledged them */
  newCount: number;
}

const initialState: FeedState = { order: [], lastUpdated: null, newCount: 0 };

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setOrder(state, action: PayloadAction<string[]>) {
      state.order = action.payload;
    },
    resetOrder(state) {
      state.order = [];
    },
    feedRefreshed(state, action: PayloadAction<{ at: number; newItems: number }>) {
      state.lastUpdated = action.payload.at;
      state.newCount += action.payload.newItems;
    },
    acknowledgeNew(state) {
      state.newCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => {
      if (Array.isArray(payload.order)) state.order = payload.order.filter((x): x is string => typeof x === 'string');
    });
  },
});

export const { setOrder, resetOrder, feedRefreshed, acknowledgeNew } = feedSlice.actions;
export default feedSlice.reducer;
