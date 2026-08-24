'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../Logo';
import EndGrain from '../EndGrain';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

export default function AdminLogin({
  googleEnabled,
  passwordEnabled,
}: {
  googleEnabled: boolean;
  passwordEnabled: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const btnRef = useRef<HTMLDivElement | null>(null);

  const submit = useCallback(
    async (payload: { password?: string; credential?: string }) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Sign in failed.');
          setBusy(false);
          return;
        }
        router.push('/admin');
        router.refresh();
      } catch {
        setError('Could not reach the server.');
        setBusy(false);
      }
    },
    [router],
  );

  /* Google button, only when an allowlist exists */
  useEffect(() => {
    if (!googleEnabled) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;

    const init = () => {
      const g = (window as unknown as { google?: any }).google;
      if (cancelled || !g?.accounts?.id || !btnRef.current) return;
      g.accounts.id.initialize({
        client_id: clientId,
        callback: (r: { credential?: string }) => {
          if (r?.credential) void submit({ credential: r.credential });
        },
        ux_mode: 'popup',
        auto_select: false,
      });
      g.accounts.id.renderButton(btnRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: 320,
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      init();
    } else {
      const s = document.createElement('script');
      s.src = GSI_SRC;
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    }

    return () => {
      cancelled = true;
    };
  }, [googleEnabled, submit]);

  return (
    <div className="relative grid min-h-screen place-items-center px-5 py-16">
      <EndGrain className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 text-patina opacity-[0.1]" />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="card mt-8 p-8">
          <p className="stamp text-center">Staff only</p>
          <h1 className="mt-3 text-center font-display text-2xl">Sign in to the panel</h1>

          {error && (
            <p role="alert" className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-birch">
              {error}
            </p>
          )}

          {googleEnabled && (
            <div className="mt-7">
              <div ref={btnRef} className="flex min-h-[44px] justify-center [color-scheme:light]" />
              <p className="mt-3 text-center stamp">Only allowlisted accounts get in</p>
            </div>
          )}

          {googleEnabled && passwordEnabled && (
            <div className="my-7 flex items-center gap-4">
              <span className="h-px flex-1 bg-edge" />
              <span className="stamp">or</span>
              <span className="h-px flex-1 bg-edge" />
            </div>
          )}

          {passwordEnabled && (
            <div className={googleEnabled ? '' : 'mt-7'}>
              <label htmlFor="admin-password" className="field-label">
                Admin password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password) void submit({ password });
                }}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                disabled={busy || !password}
                onClick={() => submit({ password })}
                className="btn-primary mt-4 w-full"
              >
                {busy ? 'Checking…' : 'Sign in'}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="font-mono text-2xs uppercase tracking-stamp text-muted hover:text-patina">
            Back to the shop
          </Link>
        </p>
      </div>
    </div>
  );
}
