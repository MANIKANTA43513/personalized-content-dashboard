'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useGetTrendingQuery } from '@/services/api/contentApi';
import { useAppSelector } from '@/store/hooks';
import type { Category, ContentType } from '@/types/content';
import { filterByCategories } from '@/store/selectors';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SectionSkeleton } from '@/components/common/Skeletons';
import { CardGrid } from '@/components/content/CardGrid';
import { PageHeader } from './PageHeader';
import { NoCategoriesState } from './NoCategoriesState';

const SECTIONS: { type: ContentType; titleKey: string }[] = [
  { type: 'news', titleKey: 'trending.news' },
  { type: 'recommendation', titleKey: 'trending.recs' },
  { type: 'social', titleKey: 'trending.social' },
];

export function TrendingView() {
  const { t } = useTranslation();
  const categories = useAppSelector((s) => s.preferences.categories);
  const hydrated = useAppSelector((s) => s.ui.hydrated);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const activeFilter = filter === 'all' || categories.includes(filter) ? filter : 'all';
  const { data, isLoading, isError, error, refetch } = useGetTrendingQuery({ categories }, { skip: !hydrated || categories.length === 0 });

  let body;
  if (hydrated && categories.length === 0) body = <NoCategoriesState />;
  else if (!hydrated || isLoading) body = <SectionSkeleton label={t('common.loading')} />;
  else if (isError) body = <ErrorState message={(error as { message?: string } | undefined)?.message} onRetry={() => void refetch()} />;
  else if (!data) body = null;
  else {
    const visible = SECTIONS.map((s) => ({ ...s, items: activeFilter === 'all' ? data[s.type] : filterByCategories(data[s.type], [activeFilter]) }));
    body = visible.every((s) => s.items.length === 0) ? (
      <EmptyState icon={<TrendingUp className="h-6 w-6" />} title={t('empty.trendingTitle')} description={t('empty.trendingBody')} actions={<button type="button" className="btn-secondary" onClick={() => setFilter('all')}>{t('trending.allTopics')}</button>} />
    ) : (
      <div className="space-y-10">
        {visible.filter((s) => s.items.length > 0).map((s) => (
          <section key={s.type} aria-labelledby={`trend-${s.type}`} data-testid={`trending-${s.type}`}>
            <h2 id={`trend-${s.type}`} className="mb-4 text-2xl font-semibold">{t(s.titleKey)}</h2>
            <CardGrid items={s.items.slice(0, 6)} ranked />
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader title={t('trending.title')} description={t('trending.subtitle')} actions={categories.length === 0 ? <Link href="/settings" className="btn-secondary">{t('empty.chooseTopics')}</Link> : undefined} />
      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={t('trending.filter')}>
          {(['all', ...categories] as const).map((c) => (
            <button key={c} type="button" aria-pressed={activeFilter === c} onClick={() => setFilter(c)} className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${activeFilter === c ? 'border-transparent bg-accent text-accent-ink' : 'border-line bg-surface text-muted hover:text-ink'}`}>
              {c === 'all' ? t('trending.allTopics') : t(`category.${c}`)}
            </button>
          ))}
        </div>
      )}
      {body}
    </>
  );
}
