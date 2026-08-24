'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Logo from '../Logo';

const TABS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/customers', label: 'Customers' },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-ink/95 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" aria-label="Admin dashboard">
            <Logo compact />
          </Link>
          <span className="hidden rounded-full border border-edge px-3 py-1 font-mono text-2xs uppercase tracking-stamp text-patina sm:inline">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[14rem] truncate font-mono text-2xs text-muted md:inline">
            {email}
          </span>
          <Link
            href="/"
            className="hidden rounded-full border border-edge px-4 py-2 text-sm text-birch transition-colors hover:border-patina hover:text-patina sm:inline-block"
          >
            View shop
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            className="rounded-full border border-edge px-4 py-2 text-sm text-muted transition-colors hover:border-patina hover:text-patina disabled:opacity-50"
          >
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>

      <nav aria-label="Admin sections" className="shell">
        <ul className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-block whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors ${
                    active
                      ? 'border-patina text-patina'
                      : 'border-transparent text-muted hover:text-birch'
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
