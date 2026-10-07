import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { CATEGORIES, type Category } from '@/types/content';
import type { Language, UserPreferences } from '@/types/user';
import { hydrate } from '../hydrate';

export const DEFAULT_CATEGORIES: Category[] = ['technology', 'science', 'entertainment'];

export const initialPreferences: UserPreferences = {
  categories: DEFAULT_CATEGORIES,
  language: 'en',
  liveUpdates: true,
};

const LANGS: Language[] = ['en', 'es', 'hi'];

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: initialPreferences,
  reducers: {
    toggleCategory(state, action: PayloadAction<Category>) {
      const i = state.categories.indexOf(action.payload);
      if (i >= 0) state.categories.splice(i, 1);
      else state.categories.push(action.payload);
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = Array.from(new Set(action.payload));
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setLiveUpdates(state, action: PayloadAction<boolean>) {
      state.liveUpdates = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => {
      const p = payload.preferences;
      if (!p) return;
      // Validate persisted data — localStorage can be stale or hand-edited.
      if (Array.isArray(p.categories)) state.categories = p.categories.filter((c): c is Category => (CATEGORIES as readonly string[]).includes(c));
      if (p.language && LANGS.includes(p.language)) state.language = p.language;
      if (typeof p.liveUpdates === 'boolean') state.liveUpdates = p.liveUpdates;
    });
  },
});

export const { toggleCategory, setCategories, setLanguage, setLiveUpdates } = preferencesSlice.actions;
export default preferencesSlice.reducer;
