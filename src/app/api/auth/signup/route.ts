import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DEMO_ACCOUNT, SESSION_COOKIE, createSessionToken, sessionCookieOptions, userFromEmail } from '@/lib/server/auth';

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  email: z.string().email().max(120),
  password: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/\d/),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Enter your name, a valid email, and a password of 8+ characters with a letter and a number.' } }, { status: 400 });
  }
  if (body.data.email.toLowerCase() === DEMO_ACCOUNT.email) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'That email is reserved for the demo account.' } }, { status: 409 });
  }
  const user = userFromEmail(body.data.email, body.data.name);
  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions());
  return res;
}
