import { route, categoriesParam, intParam } from '@/lib/server/handler';
import { fetchFeed } from '@/lib/server/sources';
import { parseCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return route(request, (url) =>
    fetchFeed({
      categories: categoriesParam(url),
      page: intParam(url, 'page', 1, 1, 200),
      pageSize: intParam(url, 'pageSize', 12, 3, 30),
      history: parseCategories(url.searchParams.get('history')),
    }),
  );
}
