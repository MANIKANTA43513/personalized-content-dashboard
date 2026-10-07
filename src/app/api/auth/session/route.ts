import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: { code: 'unauthorized', message: 'Not signed in.' } }, { status: 401 });
  return NextResponse.json({ user });
}
