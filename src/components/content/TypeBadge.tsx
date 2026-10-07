'use client';

import { Film, Newspaper, MessageCircle, Music, Tv } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ContentItem } from '@/types/content';

const STYLE = {
  news: 'bg-news/10 text-news',
  recommendation: 'bg-rec/10 text-rec',
  social: 'bg-social/10 text-social',
} as const;

export function TypeBadge({ item }: { item: ContentItem }) {
  const { t } = useTranslation();
  const Icon =
    item.type === 'news' ? Newspaper : item.type === 'social' ? MessageCircle : item.mediaKind === 'music' ? Music : item.mediaKind === 'series' ? Tv : Film;
  const label = item.type === 'recommendation' ? t(`media.${item.mediaKind}`) : t(`type.${item.type}`);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STYLE[item.type]}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
