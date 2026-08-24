import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminPassword,
  isAdminEmail,
  newAdminToken,
} from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Brute force ko dheema karta hai — chhoti site ke liye kaafi hai. */
const attempts = new Map<string, { n: number; until: number }>();

function throttled(key: string) {
  const rec = attempts.get(key);
  if (rec && rec.until > Date.now()) return true;
  return false;
}

function noteFailure(key: string) {
  const rec = attempts.get(key) ?? { n: 0, until: 0 };
  rec.n += 1;
  if (rec.n >= 5) {
    rec.until = Date.now() + 5 * 60_000;
    rec.n = 0;
  }
  attempts.set(key, rec);
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (throttled(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  let body: { password?: string; credential?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  /* ---- route A: Google account on the allowlist ---- */
  if (body.credential) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 503 });
    }
    try {
      const res = await fetch(
        'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(body.credential),
        { cache: 'no-store' },
      );
      const info = (await res.json()) as {
        aud?: string;
        email?: string;
        email_verified?: string | boolean;
        exp?: string;
      };
      const ok =
        res.ok &&
        info.aud === clientId &&
        (info.email_verified === true || info.email_verified === 'true') &&
        Number(info.exp || 0) > Math.floor(Date.now() / 1000) &&
        info.email &&
        isAdminEmail(info.email);

      if (!ok) {
        noteFailure(ip);
        return NextResponse.json(
          { error: 'That Google account is not on the admin list.' },
          { status: 403 },
        );
      }

      const jar = await cookies();
      jar.set(ADMIN_COOKIE, newAdminToken(info.email!, 'google'), adminCookieOptions);
      return NextResponse.json({ ok: true, email: info.email });
    } catch {
      return NextResponse.json({ error: 'Google could not verify that sign-in.' }, { status: 401 });
    }
  }

  /* ---- route B: shared admin password ---- */
  const expected = adminPassword();
  if (!expected) {
    return NextResponse.json(
      { error: 'Password sign-in is off. Set ADMIN_PASSWORD or use an allowlisted Google account.' },
      { status: 503 },
    );
  }

  const given = String(body.password ?? '');
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    noteFailure(ip);
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, newAdminToken('admin', 'password'), adminCookieOptions);
  return NextResponse.json({ ok: true });
}
