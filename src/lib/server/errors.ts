import { NextResponse } from 'next/server';
import type { ApiErrorCode } from '@/types/content';

export class ApiFailure extends Error {
  constructor(public code: ApiErrorCode, message: string, public status = 500) {
    super(message);
    this.name = 'ApiFailure';
  }
}

const USER_MESSAGES: Record<ApiErrorCode, string> = {
  network: 'We could not reach the content service.',
  rate_limit: 'The content service is rate limiting requests. Try again in a minute.',
  invalid_response: 'The content service sent data we could not read.',
  upstream: 'The content service had a problem.',
  bad_request: 'That request was not valid.',
  unauthorized: 'You need to sign in to do that.',
  simulated: 'Simulated network error (turned on in Settings → Demo tools).',
  unknown: 'Something went wrong.',
};

export function userMessage(code: ApiErrorCode): string {
  return USER_MESSAGES[code];
}

/** Converts any thrown value to a safe JSON response — never leaks stack traces. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ApiFailure) {
    return NextResponse.json({ error: { code: err.code, message: userMessage(err.code) } }, { status: err.status });
  }
  console.error('[api] unexpected error', err instanceof Error ? err.message : 'unknown');
  return NextResponse.json({ error: { code: 'unknown', message: userMessage('unknown') } }, { status: 500 });
}

export function assertNotSimulated(request: Request): void {
  if (request.headers.get('x-simulate-error') === '1') {
    throw new ApiFailure('simulated', 'simulated', 503);
  }
}
