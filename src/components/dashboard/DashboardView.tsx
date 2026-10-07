'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Layers, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFeed } from '@/hooks/useFeed';
import { useGetTrendingQuery } from '@/services/api/contentApi';
import { useAppSelector } from '@/store/hooks';
import { CardGrid } from '@/components/content/CardGrid';
import { ErrorState } from '@/components/common/ErrorState';
import { SectionSkeleton } from '@/components/common/Skeletons';
import { LiveIndicator } from './LiveIndicator';
import { NoCategoriesState } from './NoCategoriesState';

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-card">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-raised text-accent" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

export function DashboardView() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const favorites = useAppSelector((s) => s.favorites.ids.length);
  const hydrated = useAppSelector((s) => s.ui.hydrated);
  const categories = useAppSelector((s) => s.preferences.categories);
  const feed = useFeed();
  const trending = useGetTrendingQuery({ categories }, { skip: !hydrated || categories.length === 0 });
  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" data-testid="greeting">{t('dashboard.greeting', { name: firstName })}</h1>
          <p className="mt-2 text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <LiveIndicator />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Layers className="h-5 w-5" />} label={t('dashboard.topics')} value={categories.length} />
        <Stat icon={<Heart className="h-5 w-5" />} label={t('dashboard.favorites')} value={favorites} />
        <Stat icon={<Radio className="h-5 w-5" />} label={t('dashboard.sources')} value={3} />
      </div>

      {feed.noCategories ? (
        <NoCategoriesState />
      ) : (
        <>
          <section aria-labelledby="top-picks">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="top-picks" className="text-2xl font-semibold">{t('dashboard.topPicks')}</h2>
              <Link href="/feed" className="btn-ghost">{t('dashboard.openFeed')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            {feed.isLoading ? <SectionSkeleton label={t('common.loading')} /> : feed.isError && !feed.hasData ? <ErrorState message={feed.error?.message} onRetry={feed.retry} /> : <CardGrid items={feed.items.slice(0, 3)} />}
          </section>

          <section aria-labelledby="trend-now">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="trend-now" className="text-2xl font-semibold">{t('dashboard.trendingNow')}</h2>
              <Link href="/trending" className="btn-ghost">{t('dashboard.seeTrending')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            {trending.isLoading ? <SectionSkeleton label={t('common.loading')} /> : trending.isError ? <ErrorState message={(trending.error as { message?: string } | undefined)?.message} onRetry={() => void trending.refetch()} /> : trending.data ? <CardGrid items={trending.data.news.slice(0, 3)} ranked /> : null}
          </section>
        </>
      )}
    </div>
  );
}
