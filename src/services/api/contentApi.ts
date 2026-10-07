import { createApi, fetchBaseQuery, retry, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { ApiError, ApiErrorCode, Category, ContentItem, FeedPage, SearchResult, TrendingResponse } from '@/types/content';
import type { User } from '@/types/user';

export interface FeedArgs {
  categories: Category[];
  history?: Category[];
  page: number;
  pageSize?: number;
  /** Changing this forces a refetch of page 1 (used by live polling) */
  refresh?: number;
}

const apiBase = () => (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3000/api');

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBase(),
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { ui?: { simulateError?: boolean } };
    if (state.ui?.simulateError) headers.set('x-simulate-error', '1');
    return headers;
  },
});

const KNOWN_CODES: ApiErrorCode[] = ['network', 'rate_limit', 'invalid_response', 'upstream', 'bad_request', 'unauthorized', 'simulated', 'unknown'];

export function toApiError(error: FetchBaseQueryError | undefined | unknown): ApiError {
  const e = error as { status?: unknown; data?: unknown } | undefined;
  if (e?.status === 'FETCH_ERROR') return { code: 'network', message: 'We could not reach the server. Check your connection and try again.' };
  if (e?.status === 'PARSING_ERROR') return { code: 'invalid_response', message: 'The server sent data we could not read.' };
  const data = e?.data as { error?: { code?: string; message?: string } } | undefined;
  const code = data?.error?.code;
  if (code && (KNOWN_CODES as string[]).includes(code)) return { code: code as ApiErrorCode, message: data?.error?.message ?? 'Something went wrong.' };
  return { code: 'unknown', message: 'Something went wrong. Please try again.' };
}

/** Only transport-level failures are retried; API errors (4xx/5xx) surface immediately. */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = retry(
  async (args, api, extra) => {
    const result = await rawBaseQuery(args, api, extra);
    if (result.error && result.error.status !== 'FETCH_ERROR') retry.fail(result.error);
    return result;
  },
  { maxRetries: 1 },
);

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') sp.set(k, String(v));
  return sp.toString();
}

const cacheKey = (name: string, cats: Category[]) => `${name}(${[...cats].sort().join(',')})`;

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery,
  keepUnusedDataFor: 300,
  tagTypes: ['Session'],
  endpoints: (build) => ({
    /**
     * Infinite feed: one cache entry per category selection, pages are merged into it.
     * `page` and `refresh` are deliberately excluded from the cache key.
     */
    getFeed: build.query<FeedPage, FeedArgs>({
      query: ({ categories, history, page, pageSize = 12 }) =>
        `feed?${qs({ categories: categories.join(','), history: history?.join(','), page, pageSize })}`,
      serializeQueryArgs: ({ endpointName, queryArgs }) => cacheKey(endpointName, queryArgs.categories),
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page || currentArg?.refresh !== previousArg?.refresh,
      merge: (cache, incoming, { arg }) => {
        const seen = new Set(cache.items.map((i) => i.id));
        const fresh = incoming.items.filter((i) => !seen.has(i.id));
        if (arg.page === 1) {
          // refresh of an already-loaded feed: prepend new items, keep pagination cursor
          cache.items.unshift(...fresh);
          cache.mode = incoming.mode;
          cache.errors = incoming.errors;
          return;
        }
        cache.items.push(...fresh);
        cache.page = incoming.page;
        cache.hasMore = incoming.hasMore;
        cache.total = incoming.total;
        cache.errors = incoming.errors;
      },
      transformErrorResponse: (e) => toApiError(e),
    }),
    getTrending: build.query<TrendingResponse, { categories: Category[] }>({
      query: ({ categories }) => `trending?${qs({ categories: categories.join(',') })}`,
      transformErrorResponse: (e) => toApiError(e),
    }),
    search: build.query<SearchResult, { q: string }>({
      query: ({ q }) => `search?${qs({ q })}`,
      transformErrorResponse: (e) => toApiError(e),
    }),
    getSession: build.query<{ user: User }, void>({
      query: () => 'auth/session',
      providesTags: ['Session'],
      transformErrorResponse: (e) => toApiError(e),
    }),
    login: build.mutation<{ user: User }, { email: string; password: string }>({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      invalidatesTags: ['Session'],
      transformErrorResponse: (e) => toApiError(e),
    }),
    signup: build.mutation<{ user: User }, { name: string; email: string; password: string }>({
      query: (body) => ({ url: 'auth/signup', method: 'POST', body }),
      invalidatesTags: ['Session'],
      transformErrorResponse: (e) => toApiError(e),
    }),
    logout: build.mutation<{ ok: true }, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      invalidatesTags: ['Session'],
    }),
  }),
});

export const { useGetFeedQuery, useGetTrendingQuery, useSearchQuery, useGetSessionQuery, useLoginMutation, useSignupMutation, useLogoutMutation } = contentApi;

export type { ContentItem };
