import { route, categoriesParam, intParam } from '@/lib/server/handler';
import { fetchNews } from '@/lib/server/sources';
import { parseCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return route(request, (url) =>
    fetchNews({
      categories: categoriesParam(url),
      page: intParam(url, 'page', 1, 1, 200),
      pageSize: intParam(url, 'pageSize', 10, 1, 30),
      history: parseCategories(url.searchParams.get('history')),
    }),
  );
}
