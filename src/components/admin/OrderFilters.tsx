'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ORDER_STATUSES } from '@/lib/data/orders';
import { PAYMENT_METHODS } from '@/lib/site';
import { cx } from '@/lib/format';

export default function OrderFilters({
  status,
  payment,
  query,
}: {
  status: string;
  payment: string;
  query: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(query);

  function go(patch: Record<string, string>) {
    const params = new URLSearchParams();
    const next = { q, status, payment, ...patch };
    if (next.q) params.set('q', next.q);
    if (next.status) params.set('status', next.status);
    if (next.payment) params.set('payment', next.payment);
    const s = params.toString();
    router.push(s ? `/admin/orders?${s}` : '/admin/orders');
  }

  const active = Boolean(status || payment || query);

  return (
    <div className="card p-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.6-3.6" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') go({});
            }}
            placeholder="Order number, name, phone or email"
            aria-label="Search orders"
            className="!py-3 !pl-11"
          />
        </div>
        <button type="button" onClick={() => go({})} className="btn-primary btn-sm shrink-0 !py-3">
          Search
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="stamp w-14">Status</span>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go({ status: status === s.id ? '' : s.id })}
            className={cx('chip', status === s.id && 'chip-on')}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="stamp w-14">Payment</span>
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => go({ payment: payment === m.id ? '' : m.id })}
            className={cx('chip', payment === m.id && 'chip-on')}
          >
            {m.label}
          </button>
        ))}
      </div>

      {active && (
        <button
          type="button"
          onClick={() => {
            setQ('');
            router.push('/admin/orders');
          }}
          className="mt-4 font-mono text-2xs uppercase tracking-stamp text-patina underline underline-offset-4"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
