import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, cookieOptions, sealSession, SESSION_MAX_AGE } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TokenInfo {
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  exp?: string;
  error_description?: string;
}

export async function POST(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google sign-in is not configured on this site yet.' },
      { status: 503 },
    );
  }

  let credential: string | undefined;
  try {
    const body = (await request.json()) as { credential?: string };
    credential = body.credential;
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  if (!credential || credential.length > 4096) {
    return NextResponse.json({ error: 'Missing Google credential.' }, { status: 400 });
  }

  // Verify the ID token with Google rather than trusting the browser.
  let info: TokenInfo;
  try {
    const res = await fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential),
      { cache: 'no-store' },
    );
    info = (await res.json()) as TokenInfo;
    if (!res.ok) throw new Error(info.error_description || 'invalid');
  } catch {
    return NextResponse.json({ error: 'Google could not verify that sign-in.' }, { status: 401 });
  }

  const audOk = info.aud === clientId;
  const verified = info.email_verified === true || info.email_verified === 'true';
  const notExpired = Number(info.exp || 0) > Math.floor(Date.now() / 1000);

  if (!info.sub || !info.email || !audOk || !verified || !notExpired) {
    return NextResponse.json({ error: 'That Google account could not be accepted.' }, { status: 401 });
  }

  const user = {
    sub: info.sub,
    name: info.name || info.email.split('@')[0],
    email: info.email,
    picture: info.picture || '',
  };

  const token = sealSession({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, cookieOptions);

  return NextResponse.json({ user });
}
