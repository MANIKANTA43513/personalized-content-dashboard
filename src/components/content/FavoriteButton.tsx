'use client';

import { Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ContentItem } from '@/types/content';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import { announce } from '@/store/slices/uiSlice';

/** Reads state from Redux by id, so the same item is always in sync across Feed, Trending, Search and Favorites. */
export function FavoriteButton({ item }: { item: ContentItem }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const reduce = useReducedMotion();
  const isFavorite = useAppSelector((s) => Boolean(s.favorites.byId[item.id]));

  const onClick = () => {
    dispatch(toggleFavorite(item));
    dispatch(announce(isFavorite ? t('favorite.removed') : t('favorite.added')));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t('favorite.remove', { title: item.title }) : t('favorite.add', { title: item.title })}
      data-testid="favorite-button"
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        isFavorite ? 'border-transparent bg-danger/15 text-danger' : 'border-line bg-surface/90 text-muted hover:text-ink'
      }`}
    >
      <motion.span key={String(isFavorite)} initial={reduce ? false : { scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        <Heart className="h-[18px] w-[18px]" fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </motion.span>
    </button>
  );
}
