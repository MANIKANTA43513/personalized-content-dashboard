import { route, categoriesParam } from '@/lib/server/handler';
import { fetchTrending } from '@/lib/server/sources';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return route(request, (url) => fetchTrending(categoriesParam(url)));
}
