import type { Category } from './content';

export type ThemeMode = 'light' | 'dark';
export type Language = 'en' | 'es' | 'hi';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserPreferences {
  categories: Category[];
  language: Language;
  /** Whether the feed should poll for new content */
  liveUpdates: boolean;
}
