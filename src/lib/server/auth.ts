import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { User } from '@/types/user';
import { getEnv } from './env';

/**
 * MOCK authentication (documented in README).
 * - Sessions are stateless: an HMAC-signed, httpOnly, SameSite=Lax cookie.
 * - Passwords are validated for shape and then discarded — never stored or logged.
 */
export const SESSION_COOKIE = 'pcd_session';
const SESSION_TTL_S = 60 * 60 * 24 * 7;

let fallbackSecret: string | null = null;
function secret(): string {
  const configured = getEnv().AUTH_SECRET;
  if (configured) return configured;
  if (!fallbackSecret) {
    fallbackSecret = randomBytes(32).toString('hex');
    console.warn('[auth] AUTH_SECRET is not set; using a per-process secret. Sessions reset on restart.');
  }
  return fallbackSecret;
}

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function createSessionToken(user: User, now = Date.now()): string {
  const payload = b64(JSON.stringify({ ...user, exp: Math.floor(now / 1000) + SESSION_TTL_S }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): User | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<User> & { exp?: number };
    if (!data.exp || data.exp * 1000 < now) return null;
    if (typeof data.id !== 'string' || typeof data.name !== 'string' || typeof data.email !== 'string') return null;
    return { id: data.id, name: data.name, email: data.email };
  } catch {
    return null;
  }
}

export function getSessionUser(): User | null {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_S,
  };
}

export const DEMO_ACCOUNT = { email: 'demo@pulse.dev', password: 'Demo@1234', name: 'Demo User' };

export function userFromEmail(email: string, name?: string): User {
  const local = email.split('@')[0] ?? 'user';
  const display = name?.trim() || local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const id = createHmac('sha256', 'uid').update(email.toLowerCase()).digest('hex').slice(0, 16);
  return { id, name: display.slice(0, 60), email: email.toLowerCase() };
}
