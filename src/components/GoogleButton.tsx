'use client';

import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';

/**
 * Renders Google's own button. If the site has no client ID configured yet,
 * it says so plainly instead of rendering a control that cannot work.
 */
export default function GoogleButton({ className = '' }: { className?: string }) {
  const { mountButton, configured, busy, error } = useAuth();

  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      mountButton(el);
    },
    [mountButton],
  );

  if (!configured) {
    return (
      <p className={`rounded-2xl border border-dashed border-edge px-4 py-3 text-sm text-muted ${className}`}>
        Google sign-in turns on once <code className="font-mono text-2xs text-patina">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>{' '}
        is set. You can still check out as a guest.
      </p>
    );
  }

  return (
    <div className={className}>
      <div ref={ref} className="flex min-h-[44px] justify-center [color-scheme:light]" />
      {busy && <p className="mt-2 text-center font-mono text-2xs uppercase tracking-stamp text-muted">Signing you in…</p>}
      {error && <p className="mt-2 text-center text-sm text-patina-soft">{error}</p>}
    </div>
  );
}
