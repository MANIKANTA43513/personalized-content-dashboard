'use client';

import { useId } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearSearch, setQuery } from '@/store/slices/searchSlice';

/**
 * Header search input. It only updates Redux state (cheap, per keystroke);
 * network requests are debounced on the results page (see useDebouncedValue).
 */
export function SearchBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const query = useAppSelector((s) => s.search.query);
  const id = useId();

  const onChange = (value: string) => {
    dispatch(setQuery(value));
    if (value.trim() && pathname !== '/search') router.push('/search');
  };

  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); if (query.trim() && pathname !== '/search') router.push('/search'); }} className="relative w-full max-w-xl">
      <label htmlFor={id} className="sr-only">{t('search.label')}</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        id={id}
        type="search"
        data-testid="search-input"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('search.placeholder')}
        autoComplete="off"
        className="input h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button type="button" onClick={() => dispatch(clearSearch())} aria-label={t('search.clear')} data-testid="search-clear" className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-raised hover:text-ink">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
