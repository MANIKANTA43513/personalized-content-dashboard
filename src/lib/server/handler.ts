import { NextResponse } from 'next/server';
import { CATEGORIES, type Category } from '@/types/content';
import { parseCategories } from '@/lib/categories';
import { ApiFailure, assertNotSimulated, errorResponse } from './errors';

export function intParam(url: URL, name: string, fallback: number, min: number, max: number): number {
  const raw = url.searchParams.get(name);
  if (raw === null) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) throw new ApiFailure('bad_request', `bad ${name}`, 400);
  return n;
}

export function categoriesParam(url: URL): Category[] {
  const raw = url.searchParams.get('categories');
  const parsed = parseCategories(raw);
  if (raw && parsed.length === 0) throw new ApiFailure('bad_request', 'bad categories', 400);
  return parsed.length ? parsed : [...CATEGORIES];
}

export async function route(request: Request, fn: (url: URL) => Promise<unknown>): Promise<NextResponse> {
  try {
    assertNotSimulated(request);
    const data = await fn(new URL(request.url));
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, max-age=0, must-revalidate' } });
  } catch (err) {
    return errorResponse(err);
  }
}
