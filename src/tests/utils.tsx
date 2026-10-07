import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import '@/i18n';
import i18n from '@/i18n';
import { makeStore, type AppStore } from '@/store';
import { setHydrated } from '@/store/slices/uiSlice';
import type { ContentItem, FeedPage, NewsItem, RecommendationItem, SocialPost } from '@/types/content';

export const news = (over: Partial<NewsItem> = {}): NewsItem => ({
  id: 'news:t-1', type: 'news', title: 'Open-source model ships faster release', description: 'A short description of the story.',
  image: '/api/placeholder?c=technology&s=a&k=news', category: 'technology', source: 'Daily Ledger', url: 'https://example.com/a',
  publishedAt: new Date(Date.now() - 3_600_000).toISOString(), author: 'A. Writer', trendScore: 80, ...over,
});
export const rec = (over: Partial<RecommendationItem> = {}): RecommendationItem => ({
  id: 'recommendation:t-1', type: 'recommendation', mediaKind: 'movie', title: 'Signal Lost', description: 'An engineer traces an outage.',
  image: null, category: 'entertainment', source: 'Lumen+', url: 'https://example.com/m', publishedAt: new Date().toISOString(), rating: 8.2, ...over,
});
export const social = (over: Partial<SocialPost> = {}): SocialPost => ({
  id: 'social:t-1', type: 'social', title: 'Just migrated our CI to run in four minutes.', description: '#devlife', image: null, category: 'technology',
  source: 'Chirp', handle: '@nova.codes', hashtags: ['#devlife', '#webdev'], likes: 1234, url: 'https://example.com/p', publishedAt: new Date().toISOString(), ...over,
});

export function renderWithStore(ui: ReactElement, opts: { store?: AppStore; hydrated?: boolean } = {}) {
  const store = opts.store ?? makeStore();
  if (opts.hydrated !== false) store.dispatch(setHydrated());
  void i18n.changeLanguage('en');
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

export function feedPage(items: ContentItem[], over: Partial<FeedPage> = {}): FeedPage {
  return { items, page: 1, pageSize: 12, total: items.length, hasMore: false, mode: 'mock', ...over };
}

export const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

type Handler = (url: URL, request: Request) => Response | Promise<Response>;
/** Stubs global fetch with a path-based router. Returns the mock so tests can assert call counts. */
export function mockApi(routes: Record<string, Handler>) {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const request = input instanceof Request ? input : new Request(String(input));
    const url = new URL(request.url);
    const handler = routes[url.pathname.replace(/^\/api\//, '')];
    if (!handler) return json({ error: { code: 'unknown', message: 'no route' } }, 404);
    return handler(url, request);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}
