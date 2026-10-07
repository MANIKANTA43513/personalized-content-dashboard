import { route } from '@/lib/server/handler';
import { ApiFailure } from '@/lib/server/errors';
import { searchContent } from '@/lib/server/sources';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return route(request, async (url) => {
    const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
    if (q.length < 2) throw new ApiFailure('bad_request', 'query too short', 400);
    return searchContent(q);
  });
}
