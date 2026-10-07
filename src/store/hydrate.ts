import { createAction } from '@reduxjs/toolkit';
import type { ContentItem } from '@/types/content';
import type { Language, ThemeMode, UserPreferences } from '@/types/user';

export interface PersistedState {
  preferences?: Partial<UserPreferences>;
  theme?: ThemeMode;
  favorites?: Record<string, ContentItem>;
  order?: string[];
  recentSearches?: string[];
}

export const hydrate = createAction<PersistedState>('app/hydrate');
export type { Language };
