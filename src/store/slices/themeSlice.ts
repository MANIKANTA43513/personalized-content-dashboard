import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@/types/user';
import { hydrate } from '../hydrate';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'light' as ThemeMode },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => {
      if (payload.theme === 'light' || payload.theme === 'dark') state.mode = payload.theme;
    });
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
