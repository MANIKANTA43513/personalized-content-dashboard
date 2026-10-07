import { describe, expect, it } from 'vitest';
import preferences, { DEFAULT_CATEGORIES, initialPreferences, setCategories, setLanguage, toggleCategory } from '@/store/slices/preferencesSlice';
import theme, { setTheme, toggleTheme } from '@/store/slices/themeSlice';
import favorites, { clearFavorites, toggleFavorite } from '@/store/slices/favoritesSlice';
import feed, { acknowledgeNew, feedRefreshed, resetOrder, setOrder } from '@/store/slices/feedSlice';
import search, { addRecent, clearRecent, clearSearch, setFilter, setQuery, type SearchState } from '@/store/slices/searchSlice';
import ui, { setSimulateError } from '@/store/slices/uiSlice';
import { hydrate } from '@/store/hydrate';
import { news, rec } from '../utils';

describe('preferencesSlice', () => {
  it('toggles a category on and off', () => {
    let s = preferences(initialPreferences, toggleCategory('sports'));
    expect(s.categories).toContain('sports');
    s = preferences(s, toggleCategory('sports'));
    expect(s.categories).not.toContain('sports');
  });
  it('supports selecting multiple categories and dedupes setCategories', () => {
    const s = preferences(initialPreferences, setCategories(['health', 'health', 'finance']));
    expect(s.categories).toEqual(['health', 'finance']);
  });
  it('allows an empty selection (drives the "no categories" empty state)', () => {
    expect(preferences(initialPreferences, setCategories([])).categories).toEqual([]);
  });
  it('hydrates from storage but discards unknown categories and bad languages', () => {
    const s = preferences(initialPreferences, hydrate({ preferences: { categories: ['health', 'bogus' as never], language: 'xx' as never } }));
    expect(s.categories).toEqual(['health']);
    expect(s.language).toBe('en');
  });
  it('keeps defaults when nothing is persisted', () => {
    expect(preferences(initialPreferences, hydrate({})).categories).toEqual(DEFAULT_CATEGORIES);
  });
  it('sets language', () => {
    expect(preferences(initialPreferences, setLanguage('es')).language).toBe('es');
  });
});

describe('themeSlice', () => {
  it('toggles and sets', () => {
    expect(theme({ mode: 'light' }, toggleTheme()).mode).toBe('dark');
    expect(theme({ mode: 'dark' }, setTheme('light')).mode).toBe('light');
  });
  it('ignores invalid persisted theme', () => {
    expect(theme({ mode: 'light' }, hydrate({ theme: 'neon' as never })).mode).toBe('light');
  });
});

describe('favoritesSlice', () => {
  const empty = { byId: {}, ids: [] };
  it('adds then removes an item, newest first', () => {
    let s = favorites(empty, toggleFavorite(news()));
    s = favorites(s, toggleFavorite(rec()));
    expect(s.ids).toEqual(['recommendation:t-1', 'news:t-1']);
    s = favorites(s, toggleFavorite(news()));
    expect(s.ids).toEqual(['recommendation:t-1']);
    expect(s.byId['news:t-1']).toBeUndefined();
  });
  it('clears everything', () => {
    expect(favorites(favorites(empty, toggleFavorite(news())), clearFavorites())).toEqual(empty);
  });
  it('hydrates and rejects malformed entries', () => {
    const good = news();
    const s = favorites(empty, hydrate({ favorites: { [good.id]: good, junk: { id: 'other' } as never } }));
    expect(s.ids).toEqual([good.id]);
  });
});

describe('feedSlice', () => {
  it('stores and resets the card order without mutating the input', () => {
    const order = ['b', 'a'];
    const s = feed({ order: [], lastUpdated: null, newCount: 0 }, setOrder(order));
    expect(s.order).toEqual(['b', 'a']);
    expect(feed(s, resetOrder()).order).toEqual([]);
    expect(order).toEqual(['b', 'a']);
  });
  it('tracks live refreshes', () => {
    let s = feed({ order: [], lastUpdated: null, newCount: 0 }, feedRefreshed({ at: 5, newItems: 2 }));
    s = feed(s, feedRefreshed({ at: 9, newItems: 1 }));
    expect(s).toMatchObject({ lastUpdated: 9, newCount: 3 });
    expect(feed(s, acknowledgeNew()).newCount).toBe(0);
  });
  it('hydrates order and filters non-strings', () => {
    expect(feed({ order: [], lastUpdated: null, newCount: 0 }, hydrate({ order: ['a', 3 as never, 'b'] })).order).toEqual(['a', 'b']);
  });
});

describe('searchSlice', () => {
  const base = { query: '', filter: 'all' as const, recent: [] as string[] };
  it('sets query/filter and clears both', () => {
    let s = search(base, setQuery('react'));
    s = search(s, setFilter('news'));
    expect(s).toMatchObject({ query: 'react', filter: 'news' });
    expect(search(s, clearSearch())).toMatchObject({ query: '', filter: 'all' });
  });
  it('keeps recents unique (case-insensitive), capped at 5, ignoring 1-char queries', () => {
    let s: SearchState = base;
    for (const q of ['a', 'one', 'two', 'three', 'four', 'five', 'six', 'ONE']) s = search(s, addRecent(q));
    expect(s.recent).toEqual(['ONE', 'six', 'five', 'four', 'three']);
    expect(search(s, clearRecent()).recent).toEqual([]);
  });
});

describe('uiSlice', () => {
  it('toggles simulated errors', () => {
    expect(ui(undefined, setSimulateError(true)).simulateError).toBe(true);
  });
});
