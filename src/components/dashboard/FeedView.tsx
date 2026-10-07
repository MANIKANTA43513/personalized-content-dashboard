'use client';

import Link from 'next/link';
import { Inbox, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFeed } from '@/hooks/useFeed';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetOrder } from '@/store/slices/feedSlice';
import { announce } from '@/store/slices/uiSlice';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { FeedSkeleton } from '@/components/common/Skeletons';
import { SortableFeed } from '@/components/content/SortableFeed';
import { PageHeader } from './PageHeader';
import { LiveIndicator } from './LiveIndicator';
import { NoCategoriesState } from './NoCategoriesState';

export function FeedView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const feed = useFeed();
  const hasCustomOrder = useAppSelector((s) => s.feed.order.length > 0);
  const canAutoLoad = feed.hasData && feed.hasMore && !feed.isFetchingMore && !feed.isError;
  const sentinel = useInfiniteScroll<HTMLDivElement>(feed.loadMore, canAutoLoad);

  let body;
  if (feed.noCategories) body = <NoCategoriesState />;
  else if (feed.isLoading) body = <FeedSkeleton label={t('common.loading')} />;
  else if (feed.isError && !feed.hasData) body = <ErrorState message={feed.error?.message} onRetry={feed.retry} />;
  else if (feed.items.length === 0)
    body = (
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title={t('empty.feedTitle')}
        description={t('empty.feedBody')}
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={feed.retry}><RotateCw className="h-4 w-4" aria-hidden="true" />{t('common.refresh')}</button>
            <Link href="/settings" className="btn-primary">{t('empty.chooseTopics')}</Link>
          </>
        }
      />
    );
  else
    body = (
      <>
        {feed.partialErrors && (
          <p role="status" className="mb-4 rounded-lg border border-line bg-raised px-4 py-3 text-sm text-muted" data-testid="partial-error">
            {t('error.partial', { sources: Object.keys(feed.partialErrors).map((k) => t(`type.${k}`)).join(', ') })}
          </p>
        )}
        <SortableFeed items={feed.items} />
        <div ref={sentinel} className="mt-8 flex min-h-16 flex-col items-center justify-center gap-3" data-testid="feed-footer">
          {feed.isFetchingMore && <FeedSkeleton count={3} label={t('feed.loadingMore')} />}
          {feed.isError && feed.hasData && <div className="w-full"><ErrorState inline title={t('error.loadMoreTitle')} message={feed.error?.message} onRetry={feed.retry} /></div>}
          {!feed.isFetchingMore && !feed.isError && feed.hasMore && <button type="button" className="btn-secondary" onClick={feed.loadMore} data-testid="load-more">{t('feed.loadMore')}</button>}
          {!feed.hasMore && !feed.isError && <p className="text-sm text-muted" data-testid="end-of-feed">{t('feed.end')}</p>}
        </div>
      </>
    );

  return (
    <>
      <PageHeader
        title={t('feed.title')}
        description={t('feed.subtitle')}
        actions={
          <>
            <LiveIndicator />
            {hasCustomOrder && (
              <button type="button" className="btn-ghost" onClick={() => { dispatch(resetOrder()); dispatch(announce(t('feed.orderReset'))); }} data-testid="reset-order">
                {t('feed.resetOrder')}
              </button>
            )}
          </>
        }
      />
      {body}
    </>
  );
}
