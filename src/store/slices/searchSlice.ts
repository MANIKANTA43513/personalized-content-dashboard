import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentType } from '@/types/content';
import { hydrate } from '../hydrate';

export interface SearchState {
  query: string;
  filter: ContentType | 'all';
  recent: string[];
}

const initialState: SearchState = { query: '', filter: 'all', recent: [] };

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setFilter(state, action: PayloadAction<SearchState['filter']>) {
      state.filter = action.payload;
    },
    clearSearch(state) {
      state.query = '';
      state.filter = 'all';
    },
    addRecent(state, action: PayloadAction<string>) {
      const q = action.payload.trim();
      if (q.length < 2) return;
      state.recent = [q, ...state.recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    },
    clearRecent(state) {
      state.recent = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => {
      if (Array.isArray(payload.recentSearches)) state.recent = payload.recentSearches.filter((x): x is string => typeof x === 'string').slice(0, 5);
    });
  },
});

export const { setQuery, setFilter, clearSearch, addRecent, clearRecent } = searchSlice.actions;
export default searchSlice.reducer;
