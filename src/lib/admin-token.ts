import crypto from 'node:crypto';

export const ADMIN_COOKIE = 'woodhub_admin';
export const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 hours — short on purpose

const secret = () => process.env.AUTH_SECRET || 'woodhub-dev-secret-change-me';

/** Comma separated allowlist, e.g. ADMIN_EMAILS="ammad@woodhub.pk,ops@woodhub.pk" */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const adminPassword = () => process.env.ADMIN_PASSWORD || '';

/** Panel tab tak pahunchne layak hai jab in me se koi ek raasta khula ho. */
export function adminConfigured(): boolean {
  return adminEmails().length > 0 || adminPassword().length > 0;
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

export interface AdminPayload {
  email: string;
  via: 'google' | 'password';
  exp: number;
}

const b64url = (b: Buffer | string) =>
  Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function fromB64url(s: string) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

// Purpose prefix alag hai, taake customer session cookie ko admin token ke
// taur par istemal na kiya ja sake (aur ulta bhi nahi).
const sign = (data: string) =>
  b64url(crypto.createHmac('sha256', secret()).update('admin:' + data).digest());

export function sealAdmin(payload: AdminPayload): string {
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function openAdmin(token: string | undefined): AdminPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as AdminPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    // Google se aaya session tabhi valid hai jab email abhi bhi allowlist me ho.
    if (payload.via === 'google' && !isAdminEmail(payload.email)) return null;
    if (payload.via === 'password' && !adminPassword()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function newAdminToken(email: string, via: 'google' | 'password') {
  return sealAdmin({ email, via, exp: Math.floor(Date.now() / 1000) + ADMIN_MAX_AGE });
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: ADMIN_MAX_AGE,
};
