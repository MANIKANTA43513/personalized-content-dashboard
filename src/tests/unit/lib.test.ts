import { describe, expect, it } from 'vitest';
import { applyOrder, moveItem } from '@/lib/order';
import { safeImage, safeUrl, stripHtml } from '@/lib/sanitize';
import { parseCategories } from '@/lib/categories';
import { timeAgo } from '@/lib/format';
import { filterByCategories, filterByType, selectFavoriteHistory, selectFavoriteItems } from '@/store/selectors';
import { makeStore } from '@/store';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import { news, rec, social } from '../utils';

describe('applyOrder / moveItem', () => {
  const items = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
  it('returns items unchanged without a saved order', () => {
    expect(applyOrder(items, [])).toBe(items);
  });
  it('puts saved ids first in saved order, unknown items after in natural order', () => {
    expect(applyOrder(items, ['c', 'a']).map((i) => i.id)).toEqual(['c', 'a', 'b', 'd']);
  });
  it('ignores saved ids that no longer exist', () => {
    expect(applyOrder(items, ['zzz', 'b']).map((i) => i.id)).toEqual(['b', 'a', 'c', 'd']);
  });
  it('moveItem is immutable and bounds-safe', () => {
    const list = [1, 2, 3];
    expect(moveItem(list, 0, 2)).toEqual([2, 3, 1]);
    expect(list).toEqual([1, 2, 3]);
    expect(moveItem(list, 0, 9)).toBe(list);
  });
});

describe('sanitize', () => {
  it('strips tags and entities from external text', () => {
    expect(stripHtml('<b>Hi</b> <script>alert(1)</script>&amp; bye')).toBe('Hi alert(1) & bye');
  });
  it('truncates long text', () => {
    expect(stripHtml('x'.repeat(50), 10)).toHaveLength(10);
  });
  it('returns empty string for non-strings', () => {
    expect(stripHtml(42)).toBe('');
  });
  it('only allows http(s) URLs', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#');
    expect(safeUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(safeUrl('not a url', '')).toBe('');
  });
  it('only allows https or our own placeholder images', () => {
    expect(safeImage('http://insecure.test/a.png')).toBeNull();
    expect(safeImage('data:image/svg+xml;base64,AAA')).toBeNull();
    expect(safeImage('/api/placeholder?c=science&s=x')).toBe('/api/placeholder?c=science&s=x');
    expect(safeImage('https://img.test/a.png')).toBe('https://img.test/a.png');
  });
});

describe('categories + format', () => {
  it('parses a CSV, drops unknowns and duplicates', () => {
    expect(parseCategories('sports, bogus,sports,health')).toEqual(['sports', 'health']);
    expect(parseCategories(null)).toEqual([]);
  });
  it('formats relative time', () => {
    const now = Date.parse('2026-01-01T12:00:00Z');
    expect(timeAgo('2026-01-01T10:00:00Z', now)).toBe('2 hours ago');
    expect(timeAgo('garbage', now)).toBe('');
  });
});

describe('content filtering + selectors', () => {
  const all = [news(), rec(), social()];
  it('filters by type and categories', () => {
    expect(filterByType(all, 'news')).toHaveLength(1);
    expect(filterByType(all, 'all')).toHaveLength(3);
    expect(filterByCategories(all, ['entertainment']).map((i) => i.type)).toEqual(['recommendation']);
    expect(filterByCategories(all, [])).toHaveLength(3);
  });
  it('favorite selectors expose items newest-first and category history', () => {
    const store = makeStore();
    store.dispatch(toggleFavorite(news()));
    store.dispatch(toggleFavorite(rec()));
    store.dispatch(toggleFavorite(social()));
    expect(selectFavoriteItems(store.getState()).map((i) => i.type)).toEqual(['social', 'recommendation', 'news']);
    expect(selectFavoriteHistory(store.getState())).toEqual(['technology', 'entertainment', 'technology']);
  });
});
