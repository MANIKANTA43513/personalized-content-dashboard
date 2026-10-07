import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem } from '@/types/content';
import { hydrate } from '../hydrate';

/**
 * Full items are stored (not just ids) so Favorites renders instantly offline
 * and independently of whichever page/search originally surfaced the item.
 */
export interface FavoritesState {
  byId: Record<string, ContentItem>;
  /** Most recently added first */
  ids: string[];
}

const initialState: FavoritesState = { byId: {}, ids: [] };

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const item = action.payload;
      if (state.byId[item.id]) {
        delete state.byId[item.id];
        state.ids = state.ids.filter((id) => id !== item.id);
      } else {
        state.byId[item.id] = item;
        state.ids.unshift(item.id);
      }
    },
    clearFavorites() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => {
      if (!payload.favorites || typeof payload.favorites !== 'object') return;
      const entries = Object.entries(payload.favorites).filter(([id, v]) => v && typeof v === 'object' && v.id === id && typeof v.title === 'string');
      state.byId = Object.fromEntries(entries);
      state.ids = entries.map(([id]) => id);
    });
  },
});

export const { toggleFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
