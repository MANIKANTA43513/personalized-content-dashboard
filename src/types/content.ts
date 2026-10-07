export const CATEGORIES = [
  'technology',
  'sports',
  'finance',
  'entertainment',
  'business',
  'science',
  'health',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CONTENT_TYPES = ['news', 'recommendation', 'social'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

interface BaseItem {
  /** Globally unique, stable id: `${type}:${source-specific id}` */
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: Category;
  source: string;
  url: string;
  /** ISO-8601 */
  publishedAt: string;
  /** 0-100, used to rank the Trending section */
  trendScore?: number;
}

export interface NewsItem extends BaseItem {
  type: 'news';
  author?: string;
}

export interface RecommendationItem extends BaseItem {
  type: 'recommendation';
  mediaKind: 'movie' | 'music' | 'series';
  /** 0-10 */
  rating?: number;
}

export interface SocialPost extends BaseItem {
  type: 'social';
  handle: string;
  hashtags: string[];
  likes: number;
}

export type ContentItem = NewsItem | RecommendationItem | SocialPost;

export type SourceMode = 'live' | 'mock';

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  mode: SourceMode;
}

export interface FeedPage extends Page<ContentItem> {
  /** Per-source failures — the feed still renders what it could load. */
  errors?: Partial<Record<ContentType, string>>;
}

export interface TrendingResponse {
  news: ContentItem[];
  recommendation: ContentItem[];
  social: ContentItem[];
  mode: SourceMode;
}

export interface SearchResult {
  query: string;
  groups: Record<ContentType, ContentItem[]>;
  total: number;
  mode: SourceMode;
  errors?: Partial<Record<ContentType, string>>;
}

export type ApiErrorCode =
  | 'network'
  | 'rate_limit'
  | 'invalid_response'
  | 'upstream'
  | 'bad_request'
  | 'unauthorized'
  | 'simulated'
  | 'unknown';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}
