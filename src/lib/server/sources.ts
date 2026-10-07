import {
  CATEGORIES,
  type Category,
  type ContentItem,
  type ContentType,
  type FeedPage,
  type NewsItem,
  type Page,
  type RecommendationItem,
  type SearchResult,
  type SourceMode,
  type TrendingResponse,
} from '@/types/content';
import { safeImage, safeUrl, stripHtml } from '@/lib/sanitize';
import { ApiFailure, userMessage } from './errors';
import { getEnv } from './env';
import { getCatalogue, getLiveItems, matchesQuery } from './mockData';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export interface SourceArgs {
  categories: Category[];
  page: number;
  pageSize: number;
  /** categories the user favourited, used to bias recommendations */
  history?: Category[];
}

async function mockDelay() {
  const { MOCK_DELAY_MS } = getEnv();
  if (MOCK_DELAY_MS > 0) await sleep(MOCK_DELAY_MS);
}

function paginate<T>(all: T[], page: number, pageSize: number): { items: T[]; total: number; hasMore: boolean } {
  const start = (page - 1) * pageSize;
  return { items: all.slice(start, start + pageSize), total: all.length, hasMore: start + pageSize < all.length };
}

async function getJson(url: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 120 } });
  } catch {
    throw new ApiFailure('network', 'fetch failed', 502);
  }
  if (res.status === 429) throw new ApiFailure('rate_limit', 'rate limited', 429);
  if (res.status === 401 || res.status === 403) throw new ApiFailure('upstream', 'credentials rejected', 502);
  if (!res.ok) throw new ApiFailure('upstream', `status ${res.status}`, 502);
  try {
    return await res.json();
  } catch {
    throw new ApiFailure('invalid_response', 'bad json', 502);
  }
}

/* ------------------------------------------------------------------ NEWS */

const NEWS_API_CATEGORY: Record<Category, { category: string; q?: string }> = {
  technology: { category: 'technology' },
  sports: { category: 'sports' },
  finance: { category: 'business', q: 'finance' },
  entertainment: { category: 'entertainment' },
  business: { category: 'business' },
  science: { category: 'science' },
  health: { category: 'health' },
};

function normalizeNewsArticle(raw: unknown, category: Category, index: number): NewsItem | null {
  if (!isRecord(raw)) return null;
  const title = stripHtml(raw.title, 200);
  const url = safeUrl(raw.url, '');
  if (!title || !url || title === '[Removed]') return null;
  const source = isRecord(raw.source) && typeof raw.source.name === 'string' ? stripHtml(raw.source.name, 60) : 'News';
  const published = typeof raw.publishedAt === 'string' && !Number.isNaN(Date.parse(raw.publishedAt)) ? raw.publishedAt : new Date().toISOString();
  return {
    id: `news:${category}-${url}`,
    type: 'news',
    title,
    description: stripHtml(raw.description, 280) || title,
    image: safeImage(raw.urlToImage),
    category,
    source,
    author: typeof raw.author === 'string' ? stripHtml(raw.author, 60) || undefined : undefined,
    url,
    publishedAt: published,
    trendScore: Math.max(10, 95 - index * 4),
  };
}

async function liveNews({ categories, page, pageSize }: SourceArgs, key: string): Promise<Page<ContentItem>> {
  const cats = categories.length ? categories : [...CATEGORIES];
  const per = Math.max(1, Math.ceil(pageSize / cats.length));
  const results = await Promise.all(
    cats.map(async (category) => {
      const m = NEWS_API_CATEGORY[category];
      const params = new URLSearchParams({ category: m.category, page: String(page), pageSize: String(per), language: 'en', apiKey: key });
      if (m.q) params.set('q', m.q);
      const json = await getJson(`https://newsapi.org/v2/top-headlines?${params}`);
      if (!isRecord(json) || !Array.isArray(json.articles)) throw new ApiFailure('invalid_response', 'shape', 502);
      const items = json.articles.map((a, i) => normalizeNewsArticle(a, category, i)).filter((x): x is NewsItem => x !== null);
      const total = typeof json.totalResults === 'number' ? json.totalResults : items.length;
      return { items, total, hasMore: page * per < total };
    }),
  );
  const seen = new Set<string>();
  const items = results.flatMap((r) => r.items).filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
  items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { items, page, pageSize, total: results.reduce((s, r) => s + r.total, 0), hasMore: results.some((r) => r.hasMore), mode: 'live' };
}

export async function fetchNews(args: SourceArgs): Promise<Page<ContentItem>> {
  const { NEWS_API_KEY } = getEnv();
  if (NEWS_API_KEY) return liveNews(args, NEWS_API_KEY);
  await mockDelay();
  const { items, total, hasMore } = paginate(getCatalogue('news', args.categories), args.page, args.pageSize);
  return { items, page: args.page, pageSize: args.pageSize, total, hasMore, mode: 'mock' };
}

/* ------------------------------------------------------------ RECOMMENDATIONS */

/** Approximate TMDB genre per dashboard category. */
const TMDB_GENRE: Record<Category, number> = {
  technology: 878,
  sports: 99,
  finance: 18,
  entertainment: 35,
  business: 53,
  science: 99,
  health: 18,
};

function normalizeMovie(raw: unknown, category: Category, index: number): RecommendationItem | null {
  if (!isRecord(raw) || typeof raw.id !== 'number') return null;
  const title = stripHtml(raw.title, 160);
  if (!title) return null;
  const poster = typeof raw.poster_path === 'string' && /^\/[\w.-]+$/.test(raw.poster_path) ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null;
  const released = typeof raw.release_date === 'string' && !Number.isNaN(Date.parse(raw.release_date)) ? new Date(raw.release_date).toISOString() : new Date().toISOString();
  return {
    id: `recommendation:tmdb-${raw.id}-${category}`,
    type: 'recommendation',
    mediaKind: 'movie',
    title,
    description: stripHtml(raw.overview, 280) || 'No synopsis available.',
    image: safeImage(poster),
    category,
    source: 'TMDB',
    url: `https://www.themoviedb.org/movie/${raw.id}`,
    publishedAt: released,
    rating: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : undefined,
    trendScore: typeof raw.popularity === 'number' ? Math.min(100, Math.round(raw.popularity / 5)) : Math.max(10, 90 - index * 4),
  };
}

async function liveRecommendations({ categories, page, pageSize, history }: SourceArgs, key: string): Promise<Page<ContentItem>> {
  const cats = categories.length ? categories : [...CATEGORIES];
  const per = Math.max(1, Math.ceil(pageSize / cats.length));
  // Biasing: favourited categories are always queried first.
  const ordered = [...cats].sort((a, b) => (history?.filter((h) => h === b).length ?? 0) - (history?.filter((h) => h === a).length ?? 0));
  const results = await Promise.all(
    ordered.map(async (category) => {
      const params = new URLSearchParams({ api_key: key, with_genres: String(TMDB_GENRE[category]), sort_by: 'popularity.desc', page: String(page), include_adult: 'false' });
      const json = await getJson(`https://api.themoviedb.org/3/discover/movie?${params}`);
      if (!isRecord(json) || !Array.isArray(json.results)) throw new ApiFailure('invalid_response', 'shape', 502);
      const items = json.results.slice(0, per).map((m, i) => normalizeMovie(m, category, i)).filter((x): x is RecommendationItem => x !== null);
      const total = typeof json.total_results === 'number' ? json.total_results : items.length;
      return { items, total, hasMore: typeof json.total_pages === 'number' ? page < json.total_pages : false };
    }),
  );
  const seen = new Set<string>();
  const items = results.flatMap((r) => r.items).filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
  return { items, page, pageSize, total: results.reduce((s, r) => s + r.total, 0), hasMore: results.some((r) => r.hasMore), mode: 'live' };
}

function biasByHistory(items: ContentItem[], history: Category[] = []): ContentItem[] {
  if (history.length === 0) return items;
  const weight = new Map<Category, number>();
  for (const h of history) weight.set(h, (weight.get(h) ?? 0) + 1);
  const score = (i: ContentItem) => Date.parse(i.publishedAt) + (weight.get(i.category) ?? 0) * 18 * 3_600_000;
  return [...items].sort((a, b) => score(b) - score(a));
}

export async function fetchRecommendations(args: SourceArgs): Promise<Page<ContentItem>> {
  const { TMDB_API_KEY } = getEnv();
  if (TMDB_API_KEY) return liveRecommendations(args, TMDB_API_KEY);
  await mockDelay();
  const sorted = biasByHistory(getCatalogue('recommendation', args.categories), args.history);
  const { items, total, hasMore } = paginate(sorted, args.page, args.pageSize);
  return { items, page: args.page, pageSize: args.pageSize, total, hasMore, mode: 'mock' };
}

/* ------------------------------------------------------------------ SOCIAL */

/** Real Twitter/Instagram APIs need paid, server-approved access, so social is a typed async mock service. */
export async function fetchSocial(args: SourceArgs): Promise<Page<ContentItem>> {
  await mockDelay();
  const { items, total, hasMore } = paginate(getCatalogue('social', args.categories), args.page, args.pageSize);
  return { items, page: args.page, pageSize: args.pageSize, total, hasMore, mode: 'mock' };
}

/* -------------------------------------------------------------------- FEED */

const FETCHERS: Record<ContentType, (a: SourceArgs) => Promise<Page<ContentItem>>> = {
  news: fetchNews,
  recommendation: fetchRecommendations,
  social: fetchSocial,
};

function interleave(lists: ContentItem[][]): ContentItem[] {
  const out: ContentItem[] = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

/** One page of the unified feed: an equal share from each source, interleaved. */
export async function fetchFeed(args: SourceArgs): Promise<FeedPage> {
  const share = Math.max(1, Math.floor(args.pageSize / 3));
  const types: ContentType[] = ['news', 'recommendation', 'social'];
  const settled = await Promise.allSettled(types.map((t) => FETCHERS[t]({ ...args, pageSize: share })));

  const errors: FeedPage['errors'] = {};
  const lists: ContentItem[][] = [];
  let hasMore = false;
  let total = 0;
  let mode: SourceMode = 'mock';
  let firstFailure: ApiFailure | null = null;

  settled.forEach((res, i) => {
    const type = types[i];
    if (res.status === 'fulfilled') {
      lists.push(res.value.items);
      hasMore ||= res.value.hasMore;
      total += res.value.total;
      if (res.value.mode === 'live') mode = 'live';
    } else {
      const failure = res.reason instanceof ApiFailure ? res.reason : new ApiFailure('unknown', 'unknown');
      firstFailure ??= failure;
      errors[type] = userMessage(failure.code);
      lists.push([]);
    }
  });

  if (firstFailure && lists.every((l) => l.length === 0)) throw firstFailure;

  let items = interleave(lists);
  if (args.page === 1 && mode === 'mock') items = [...getLiveItems(args.categories), ...items];
  return {
    items,
    page: args.page,
    pageSize: args.pageSize,
    total,
    hasMore,
    mode,
    errors: Object.keys(errors).length ? errors : undefined,
  };
}

/* ---------------------------------------------------------------- TRENDING */

export async function fetchTrending(categories: Category[]): Promise<TrendingResponse> {
  const types: ContentType[] = ['news', 'recommendation', 'social'];
  const pages = await Promise.all(types.map((t) => FETCHERS[t]({ categories, page: 1, pageSize: 30 })));
  const top = (items: ContentItem[]) => [...items].sort((a, b) => (b.trendScore ?? 0) - (a.trendScore ?? 0)).slice(0, 6);
  return {
    news: top(pages[0].items),
    recommendation: top(pages[1].items),
    social: top(pages[2].items),
    mode: pages.some((p) => p.mode === 'live') ? 'live' : 'mock',
  };
}

/* ------------------------------------------------------------------ SEARCH */

async function liveNewsSearch(q: string, key: string): Promise<ContentItem[]> {
  const params = new URLSearchParams({ q, pageSize: '8', language: 'en', sortBy: 'relevancy', apiKey: key });
  const json = await getJson(`https://newsapi.org/v2/everything?${params}`);
  if (!isRecord(json) || !Array.isArray(json.articles)) throw new ApiFailure('invalid_response', 'shape', 502);
  return json.articles.map((a, i) => normalizeNewsArticle(a, 'technology', i)).filter((x): x is NewsItem => x !== null);
}

async function liveMovieSearch(q: string, key: string): Promise<ContentItem[]> {
  const params = new URLSearchParams({ api_key: key, query: q, include_adult: 'false' });
  const json = await getJson(`https://api.themoviedb.org/3/search/movie?${params}`);
  if (!isRecord(json) || !Array.isArray(json.results)) throw new ApiFailure('invalid_response', 'shape', 502);
  return json.results.slice(0, 8).map((m, i) => normalizeMovie(m, 'entertainment', i)).filter((x): x is RecommendationItem => x !== null);
}

export async function searchContent(q: string): Promise<SearchResult> {
  const { NEWS_API_KEY, TMDB_API_KEY } = getEnv();
  const mockSearch = async (type: ContentType) => {
    await mockDelay();
    return getCatalogue(type, []).filter((i) => matchesQuery(i, q)).slice(0, 12);
  };
  const tasks: Record<ContentType, () => Promise<ContentItem[]>> = {
    news: () => (NEWS_API_KEY ? liveNewsSearch(q, NEWS_API_KEY) : mockSearch('news')),
    recommendation: () => (TMDB_API_KEY ? liveMovieSearch(q, TMDB_API_KEY) : mockSearch('recommendation')),
    social: () => mockSearch('social'),
  };
  const types: ContentType[] = ['news', 'recommendation', 'social'];
  const settled = await Promise.allSettled(types.map((t) => tasks[t]()));
  const groups: SearchResult['groups'] = { news: [], recommendation: [], social: [] };
  const errors: NonNullable<SearchResult['errors']> = {};
  let failure: ApiFailure | null = null;
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') groups[types[i]] = r.value;
    else {
      const f = r.reason instanceof ApiFailure ? r.reason : new ApiFailure('unknown', 'unknown');
      failure ??= f;
      errors[types[i]] = userMessage(f.code);
    }
  });
  if (failure && settled.every((r) => r.status === 'rejected')) throw failure;
  return {
    query: q,
    groups,
    total: groups.news.length + groups.recommendation.length + groups.social.length,
    mode: NEWS_API_KEY || TMDB_API_KEY ? 'live' : 'mock',
    errors: Object.keys(errors).length ? errors : undefined,
  };
}
