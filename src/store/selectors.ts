import { createSelector } from '@reduxjs/toolkit';
import type { Category, ContentItem, ContentType } from '@/types/content';
import type { RootState } from './index';

export const selectFavoriteIds = (s: RootState) => s.favorites.byId;
export const selectIsFavorite = (id: string) => (s: RootState) => Boolean(s.favorites.byId[id]);

/** Favourites in most-recently-added order. */
export const selectFavoriteItems = createSelector([(s: RootState) => s.favorites.byId, (s: RootState) => s.favorites.ids], (byId, ids) =>
  ids.map((id) => byId[id]).filter((x): x is ContentItem => Boolean(x)),
);

/** Categories the user has favourited, with repeats — used to bias recommendations ("history"). */
export const selectFavoriteHistory = createSelector([selectFavoriteItems], (items): Category[] => items.map((i) => i.category));

export function filterByType(items: ContentItem[], type: ContentType | 'all'): ContentItem[] {
  return type === 'all' ? items : items.filter((i) => i.type === type);
}

export function filterByCategories(items: ContentItem[], categories: Category[]): ContentItem[] {
  return categories.length === 0 ? items : items.filter((i) => categories.includes(i.category));
}
