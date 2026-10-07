'use client';

import { useEffect } from 'react';
import { History, SearchX, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchQuery } from '@/services/api/contentApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addRecent, clearRecent, clearSearch, setFilter, setQuery } from '@/store/slices/searchSlice';
import { CONTENT_TYPES, type ContentType } from '@/types/content';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SectionSkeleton } from '@/components/common/Skeletons';
import { CardGrid } from '@/components/content/CardGrid';
import { PageHeader } from '@/components/dashboard/PageHeader';

export const SEARCH_DEBOUNCE_MS = 400;

export function SearchView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useAppSelector((s) => s.search.query);
  const filter = useAppSelector((s) => s.search.filter);
  const recent = useAppSelector((s) => s.search.recent);
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS);
  const settled = debounced.length >= 2 && debounced === trimmed;
  const waiting = trimmed.length >= 2 && debounced !== trimmed;

  const { data, isFetching, isError, error, refetch } = useSearchQuery({ q: debounced }, { skip: debounced.length < 2 });

  useEffect(() => {
    if (data && data.query === debounced && data.total > 0) dispatch(addRecent(debounced));
  }, [data, debounced, dispatch]);

  const shown = (type: ContentType) => (filter === 'all' || filter === type ? data?.groups[type] ?? [] : []);
  const groups = CONTENT_TYPES.map((type) => ({ type, items: shown(type) })).filter((g) => g.items.length > 0);

  let body;
  if (trimmed.length === 0) {
    body = (
      <div className="space-y-6">
        <EmptyState testId="search-prompt" icon={<SearchX className="h-6 w-6" />} title={t('search.promptTitle')} description={t('search.promptBody')} />
        {recent.length > 0 && (
          <section aria-labelledby="recent-h">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="recent-h" className="text-lg font-semibold">{t('search.recent')}</h2>
              <button type="button" className="btn-ghost px-2 py-1" onClick={() => dispatch(clearRecent())}>{t('search.clearRecent')}</button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <li key={r}><button type="button" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm hover:bg-raised" onClick={() => dispatch(setQuery(r))}><History className="h-3.5 w-3.5" aria-hidden="true" />{r}</button></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  } else if (trimmed.length < 2) {
    body = <p className="text-sm text-muted" data-testid="search-hint">{t('search.minChars')}</p>;
  } else if (waiting || (isFetching && !data)) {
    body = <SectionSkeleton label={t('search.searching')} />;
  } else if (isError) {
    body = <ErrorState title={t('search.errorTitle')} message={(error as { message?: string } | undefined)?.message} onRetry={() => void refetch()} />;
  } else if (data && data.query === debounced && data.total === 0) {
    body = (
      <EmptyState
        testId="search-empty"
        icon={<SearchX className="h-6 w-6" />}
        title={t('search.emptyTitle', { query: debounced })}
        description={t('search.emptyBody')}
        actions={<button type="button" className="btn-secondary" onClick={() => dispatch(clearSearch())}>{t('search.clear')}</button>}
      />
    );
  } else if (data) {
    body = groups.length === 0 ? (
      <EmptyState icon={<SearchX className="h-6 w-6" />} title={t('search.emptyFilterTitle')} description={t('search.emptyFilterBody')} actions={<button type="button" className="btn-secondary" onClick={() => dispatch(setFilter('all'))}>{t('search.all')}</button>} />
    ) : (
      <div className="space-y-10" aria-busy={isFetching}>
        {data.errors && <p role="status" className="rounded-lg border border-line bg-raised px-4 py-3 text-sm text-muted">{t('error.partial', { sources: Object.keys(data.errors).map((k) => t(`type.${k}`)).join(', ') })}</p>}
        {groups.map(({ type, items }) => (
          <section key={type} aria-labelledby={`sr-${type}`} data-testid={`results-${type}`}>
            <h2 id={`sr-${type}`} className="mb-4 text-2xl font-semibold">{t(`search.group.${type}`)} <span className="text-base font-normal text-muted">({items.length})</span></h2>
            <CardGrid items={items} />
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={trimmed ? t('search.resultsFor', { query: trimmed }) : t('search.title')}
        actions={trimmed ? <button type="button" className="btn-secondary" onClick={() => dispatch(clearSearch())}><X className="h-4 w-4" aria-hidden="true" />{t('search.clear')}</button> : undefined}
      />
      {trimmed.length >= 2 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={t('search.filterType')}>
          {(['all', ...CONTENT_TYPES] as const).map((c) => (
            <button key={c} type="button" aria-pressed={filter === c} onClick={() => dispatch(setFilter(c))} className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${filter === c ? 'border-transparent bg-accent text-accent-ink' : 'border-line bg-surface text-muted hover:text-ink'}`}>
              {c === 'all' ? t('search.all') : t(`search.group.${c}`)}
            </button>
          ))}
        </div>
      )}
      <div role="region" aria-label={t('search.results')} aria-live="polite">{settled || !waiting ? body : body}</div>
    </>
  );
}
