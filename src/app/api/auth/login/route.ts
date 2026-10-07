import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DEMO_ACCOUNT, SESSION_COOKIE, createSessionToken, sessionCookieOptions, userFromEmail } from '@/lib/server/auth';

const schema = z.object({ email: z.string().email().max(120), password: z.string().min(8).max(128) });

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Enter a valid email and a password of at least 8 characters.' } }, { status: 400 });
  }
  const { email, password } = body.data;
  // Mock auth: the demo account is the only account with a fixed password.
  if (email.toLowerCase() === DEMO_ACCOUNT.email && password !== DEMO_ACCOUNT.password) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Email or password is incorrect.' } }, { status: 401 });
  }
  const user = email.toLowerCase() === DEMO_ACCOUNT.email ? userFromEmail(email, DEMO_ACCOUNT.name) : userFromEmail(email);
  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions());
  return res;
}
