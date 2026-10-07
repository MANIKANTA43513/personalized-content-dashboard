'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { contentApi, useGetFeedQuery } from '@/services/api/contentApi';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';
import { selectFavoriteHistory } from '@/store/selectors';
import { announce } from '@/store/slices/uiSlice';
import { feedRefreshed } from '@/store/slices/feedSlice';
import { applyOrder } from '@/lib/order';

export const LIVE_POLL_MS = Number(process.env.NEXT_PUBLIC_LIVE_POLL_MS) || 30_000;

/** Orchestrates the unified, infinitely-scrolling feed: paging, ordering, retry and live refresh. */
export function useFeed() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const categories = useAppSelector((s) => s.preferences.categories);
  const liveUpdates = useAppSelector((s) => s.preferences.liveUpdates);
  const hydrated = useAppSelector((s) => s.ui.hydrated);
  const order = useAppSelector((s) => s.feed.order);
  const history = useAppSelector(selectFavoriteHistory);

  const catKey = [...categories].sort().join(',');
  // Page is tied to the category selection so a preference change never requests "page 4" of a new feed.
  const [pageState, setPageState] = useState({ key: catKey, page: 1 });
  const page = pageState.key === catKey ? pageState.page : 1;

  const skip = !hydrated || categories.length === 0;
  const query = useGetFeedQuery({ categories, history, page }, { skip });
  const { data, isFetching, isLoading, isError, error, refetch } = query;

  const loadMore = useCallback(() => {
    if (!data || !data.hasMore || isFetching) return;
    setPageState({ key: catKey, page: data.page + 1 });
  }, [data, isFetching, catKey]);

  const items = useMemo(() => applyOrder(data?.items ?? [], order), [data?.items, order]);

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  // ----- live refresh (polling; architecture is transport-agnostic so SSE/WebSocket can replace it) -----
  const hasData = Boolean(data);
  const refreshing = useRef(false);
  useEffect(() => {
    if (skip || !liveUpdates || !hasData) return;
    const argsFor = (refresh: number) => ({ categories, history, page: 1, refresh });
    const id = setInterval(async () => {
      if (document.hidden || refreshing.current) return;
      refreshing.current = true;
      try {
        const before = contentApi.endpoints.getFeed.select({ categories, page: 1 })(store.getState()).data?.items.length ?? 0;
        await dispatch(contentApi.endpoints.getFeed.initiate(argsFor(Date.now()), { forceRefetch: true, subscribe: false }));
        const after = contentApi.endpoints.getFeed.select({ categories, page: 1 })(store.getState()).data?.items.length ?? 0;
        const added = Math.max(0, after - before);
        dispatch(feedRefreshed({ at: Date.now(), newItems: added }));
        if (added > 0) dispatch(announce(`${added} new items in your feed`));
      } finally {
        refreshing.current = false;
      }
    }, LIVE_POLL_MS);
    return () => clearInterval(id);
  }, [skip, liveUpdates, hasData, categories, history, dispatch, store]);

  return {
    items,
    categories,
    noCategories: hydrated && categories.length === 0,
    isLoading: !hydrated || isLoading,
    isFetchingMore: isFetching && hasData && page > 1,
    isError,
    error: error as { code: string; message: string } | undefined,
    hasData,
    hasMore: Boolean(data?.hasMore),
    partialErrors: data?.errors,
    mode: data?.mode,
    loadMore,
    retry,
  };
}
