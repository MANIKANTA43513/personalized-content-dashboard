'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectFavoriteItems } from '@/store/selectors';
import { clearFavorites } from '@/store/slices/favoritesSlice';
import { announce } from '@/store/slices/uiSlice';
import { CONTENT_TYPES, type ContentType } from '@/types/content';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { SectionSkeleton } from '@/components/common/Skeletons';
import { CardGrid } from '@/components/content/CardGrid';
import { PageHeader } from './PageHeader';

export function FavoritesView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((s) => s.ui.hydrated);
  const items = useAppSelector(selectFavoriteItems);
  const [type, setType] = useState<ContentType | 'all'>('all');
  const [confirm, setConfirm] = useState(false);
  const visible = type === 'all' ? items : items.filter((i) => i.type === type);

  return (
    <>
      <PageHeader
        title={t('favorites.title')}
        description={t('favorites.subtitle')}
        actions={items.length > 0 ? (
          <button type="button" className="btn-danger" onClick={() => setConfirm(true)} data-testid="clear-favorites"><Trash2 className="h-4 w-4" aria-hidden="true" />{t('favorites.clear')}</button>
        ) : undefined}
      />

      {!hydrated ? (
        <SectionSkeleton label={t('common.loading')} />
      ) : items.length === 0 ? (
        <EmptyState
          testId="favorites-empty"
          icon={<Heart className="h-6 w-6" />}
          title={t('empty.favoritesTitle')}
          description={t('empty.favoritesBody')}
          actions={<><Link href="/feed" className="btn-primary">{t('empty.browseFeed')}</Link><Link href="/trending" className="btn-secondary">{t('empty.exploreTrending')}</Link></>}
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={t('search.filterType')}>
            {(['all', ...CONTENT_TYPES] as const).map((c) => (
              <button key={c} type="button" aria-pressed={type === c} onClick={() => setType(c)} className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${type === c ? 'border-transparent bg-accent text-accent-ink' : 'border-line bg-surface text-muted hover:text-ink'}`}>
                {c === 'all' ? t('search.all') : t(`type.${c}`)}
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={<Heart className="h-6 w-6" />} title={t('empty.favoritesFilterTitle')} description={t('empty.favoritesFilterBody')} actions={<button type="button" className="btn-secondary" onClick={() => setType('all')}>{t('search.all')}</button>} />
          ) : (
            <div data-testid="favorites-list"><CardGrid items={visible} /></div>
          )}
        </>
      )}

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('favorites.clearTitle')}
        description={t('favorites.clearBody', { count: items.length })}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setConfirm(false)}>{t('common.cancel')}</button>
            <button type="button" className="btn-primary" data-testid="confirm-clear" onClick={() => { dispatch(clearFavorites()); dispatch(announce(t('favorites.cleared'))); setConfirm(false); }}>{t('favorites.clear')}</button>
          </>
        }
      />
    </>
  );
}
