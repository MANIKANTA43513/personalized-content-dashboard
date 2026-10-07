'use client';

import { memo, type ReactNode } from 'react';
import { ExternalLink, Flame, Heart, Star } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { ContentItem } from '@/types/content';
import { compactNumber, timeAgo } from '@/lib/format';
import { FavoriteButton } from './FavoriteButton';
import { TypeBadge } from './TypeBadge';

interface Props {
  item: ContentItem;
  /** Slot for the drag handle (rendered over the image corner) */
  dragHandle?: ReactNode;
  /** 1-based rank shown on Trending cards */
  rank?: number;
  /** Visual state while being dragged */
  dragging?: boolean;
  /** Disable entrance animation (used inside DragOverlay) */
  static?: boolean;
}

const RAIL = { news: 'bg-news', recommendation: 'bg-rec', social: 'bg-social' } as const;

function ContentCardBase({ item, dragHandle, rank, dragging, static: isStatic }: Props) {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const cta = item.type === 'news' ? t('cta.read') : item.type === 'social' ? t('cta.viewPost') : item.mediaKind === 'music' ? t('cta.play') : t('cta.details');

  return (
    <motion.article
      data-testid="content-card"
      data-item-id={item.id}
      data-type={item.type}
      aria-label={item.title}
      initial={isStatic || reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        dragging ? 'ring-2 ring-accent' : ''
      }`}
    >
      <span className={`absolute inset-x-0 top-0 z-10 h-1 ${RAIL[item.type]}`} aria-hidden="true" />

      {item.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-raised">
          {/* Plain <img>: sources are arbitrary remote hosts or generated SVG, which next/image can't optimise without a fixed domain allow-list. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" width={640} height={360} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none" />
          {rank && (
            <span className="absolute left-3 top-4 flex h-8 min-w-8 items-center justify-center rounded-full bg-ink px-2 text-sm font-semibold text-canvas" aria-label={t('trending.rank', { rank })}>
              {rank}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 pt-5">
          {rank && (
            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-ink px-2 text-sm font-semibold text-canvas" aria-label={t('trending.rank', { rank })}>
              {rank}
            </span>
          )}
        </div>
      )}

      <div className="absolute right-3 top-4 z-10 flex gap-2">
        {dragHandle}
        <FavoriteButton item={item} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge item={item} />
          <span className="rounded-full bg-raised px-2.5 py-1 text-xs text-muted">{t(`category.${item.category}`)}</span>
          {typeof item.trendScore === 'number' && rank && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Flame className="h-3.5 w-3.5 text-social" aria-hidden="true" />
              {item.trendScore}
            </span>
          )}
        </div>

        <h3 className={`font-semibold leading-snug ${item.type === 'social' ? 'text-xl' : 'text-lg'}`}>{item.title}</h3>
        {item.type !== 'social' && <p className="line-clamp-3 text-sm leading-relaxed text-muted">{item.description}</p>}

        {item.type === 'social' && (
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">{item.handle}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            {item.hashtags.join(' ')}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted">
          <span>{item.source}</span>
          <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt, Date.now(), i18n.language)}</time>
          {item.type === 'recommendation' && item.rating !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{t('card.rating')}</span>
              {item.rating.toFixed(1)}
            </span>
          )}
          {item.type === 'social' && (
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{t('card.likes')}</span>
              {compactNumber(item.likes, i18n.language)}
            </span>
          )}
        </div>

        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-secondary w-fit">
          {cta}
          <span className="sr-only">: {item.title} ({t('common.opensNewTab')})</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </motion.article>
  );
}

export const ContentCard = memo(ContentCardBase);
