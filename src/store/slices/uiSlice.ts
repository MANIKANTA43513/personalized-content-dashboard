import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  /** Mobile navigation drawer */
  navOpen: boolean;
  /** True once persisted state has been loaded from localStorage on the client */
  hydrated: boolean;
  /** Demo tool: makes every API call fail so error/retry UI can be exercised */
  simulateError: boolean;
  /** Text for the polite aria-live region (favorites, reorder, refreshes) */
  announcement: string;
}

const initialState: UiState = { navOpen: false, hydrated: false, simulateError: false, announcement: '' };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openNav(state) { state.navOpen = true; },
    closeNav(state) { state.navOpen = false; },
    setHydrated(state) { state.hydrated = true; },
    setSimulateError(state, action: PayloadAction<boolean>) { state.simulateError = action.payload; },
    announce(state, action: PayloadAction<string>) { state.announcement = action.payload; },
  },
});

export const { openNav, closeNav, setHydrated, setSimulateError, announce } = uiSlice.actions;
export default uiSlice.reducer;
