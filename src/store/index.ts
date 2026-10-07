import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { contentApi } from '@/services/api/contentApi';
import preferences from './slices/preferencesSlice';
import theme from './slices/themeSlice';
import favorites from './slices/favoritesSlice';
import feed from './slices/feedSlice';
import search from './slices/searchSlice';
import ui from './slices/uiSlice';
import auth from './slices/authSlice';

const rootReducer = combineReducers({
  preferences,
  theme,
  favorites,
  feed,
  search,
  ui,
  auth,
  [contentApi.reducerPath]: contentApi.reducer,
});

export function makeStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as ReturnType<typeof rootReducer> | undefined,
    middleware: (getDefault) => getDefault().concat(contentApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
