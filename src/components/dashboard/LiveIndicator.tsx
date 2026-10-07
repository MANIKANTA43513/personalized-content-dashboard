'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { acknowledgeNew } from '@/store/slices/feedSlice';
import { timeAgo } from '@/lib/format';

/** Subtle "live" status: pulse dot, last-updated time and a count of items that arrived since the user last looked. */
export function LiveIndicator() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const live = useAppSelector((s) => s.preferences.liveUpdates);
  const lastUpdated = useAppSelector((s) => s.feed.lastUpdated);
  const newCount = useAppSelector((s) => s.feed.newCount);
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  if (!live) return <span className="text-sm text-muted">{t('live.paused')}</span>;

  return (
    <div className="flex items-center gap-3 text-sm text-muted" data-testid="live-indicator">
      <span className="inline-flex items-center gap-2">
        <span className="pulse-dot h-2 w-2 rounded-full bg-success" aria-hidden="true" />
        {lastUpdated ? t('live.updated', { time: timeAgo(new Date(lastUpdated).toISOString(), Date.now(), i18n.language) }) : t('live.on')}
      </span>
      {newCount > 0 && (
        <button
          type="button"
          onClick={() => {
            dispatch(acknowledgeNew());
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-ink"
          data-testid="new-items"
        >
          {t('live.newItems', { count: newCount })}
        </button>
      )}
    </div>
  );
}
