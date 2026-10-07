import { describe, expect, it } from 'vitest';
import { makeStore } from '@/store';
import { STORAGE_KEY, loadPersisted, savePersisted } from '@/store/persist';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import { setCategories } from '@/store/slices/preferencesSlice';
import { setTheme } from '@/store/slices/themeSlice';
import { setOrder } from '@/store/slices/feedSlice';
import { hydrate } from '@/store/hydrate';
import { news } from '../utils';

describe('persistence', () => {
  it('round-trips preferences, theme, favorites and card order through localStorage', () => {
    const a = makeStore();
    a.dispatch(setCategories(['health', 'sports']));
    a.dispatch(setTheme('dark'));
    a.dispatch(toggleFavorite(news()));
    a.dispatch(setOrder(['x', 'y']));
    savePersisted(a.getState());

    const b = makeStore();
    b.dispatch(hydrate(loadPersisted() ?? {}));
    const s = b.getState();
    expect(s.preferences.categories).toEqual(['health', 'sports']);
    expect(s.theme.mode).toBe('dark');
    expect(s.favorites.ids).toEqual(['news:t-1']);
    expect(s.feed.order).toEqual(['x', 'y']);
  });
  it('survives corrupt storage', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadPersisted()).toBeNull();
  });
  it('never persists secrets or transient UI state', () => {
    savePersisted(makeStore().getState());
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? '';
    expect(raw).not.toMatch(/simulateError|navOpen|password|apiKey/i);
  });
});
