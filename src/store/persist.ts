import type { RootState } from './index';
import type { PersistedState } from './hydrate';

export const STORAGE_KEY = 'pcd:v1';

export function loadPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as PersistedState) : null;
  } catch {
    return null;
  }
}

export function selectPersisted(state: RootState): PersistedState {
  return {
    preferences: state.preferences,
    theme: state.theme.mode,
    favorites: state.favorites.byId,
    order: state.feed.order,
    recentSearches: state.search.recent,
  };
}

export function savePersisted(state: RootState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectPersisted(state)));
  } catch {
    // Storage may be full or blocked (private mode) — the app keeps working in-memory.
  }
}
