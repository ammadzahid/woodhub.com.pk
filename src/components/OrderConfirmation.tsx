'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pkr, orderDate } from '@/lib/format';
import { SITE } from '@/lib/site';
import type { Order } from '@/lib/orders';
import EndGrain from './EndGrain';
import { PanelSkeleton } from './Skeleton';

export default function OrderConfirmation({ number }: { number: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('woodhub.last-order');
      if (raw) {
        const parsed = JSON.parse(raw) as Order;
        if (parsed.number === number) setOrder(parsed);
      }
    } catch {
      /* fall through to the short version */
    }
    setChecked(true);
  }, [number]);

  if (!checked)
    return (
      <div className="mx-auto max-w-2xl">
        <PanelSkeleton lines={6} />
      </div>
    );

  const awaiting = order?.status === 'awaiting-verification';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-4xl border border-edge bg-bark p-8 text-center sm:p-12">
        <EndGrain className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 text-patina opacity-[0.16]" animate={false} />

        <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-patina text-ink">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>

        <h1 className="relative mt-6 font-display text-3xl leading-tight sm:text-4xl">
          Order placed
        </h1>
        <p className="relative mt-3 text-sm leading-relaxed text-muted">
          {awaiting
            ? 'We are checking your payment against the transaction ID you gave us. Once it clears, your order goes on the bench.'
            : 'It is on the bench now. You will get a WhatsApp message with tracking as soon as it leaves the workshop.'}
        </p>

        <p className="relative mt-7 inline-block rounded-full border border-edge px-5 py-2.5 font-mono text-sm tracking-widest text-patina">
          {number}
        </p>
        <p className="relative mt-3 stamp">Save this number — quote it if you message us</p>
      </div>

      {order && (
        <div className="card mt-6 p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">What you ordered</h2>
            <p className="stamp">{orderDate(order.createdAt)}</p>
          </div>

          <ul className="mt-5 divide-y divide-edge border-y border-edge">
            {order.lines.map((l) => (
              <li key={l.slug} className="flex justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">{l.name}</p>
                  <p className="mt-0.5 stamp">
                    {l.qty} × {pkr(l.unitPrice)}
                    {l.engraving && ` · “${l.engraving}”`}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm">{pkr(l.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{pkr(order.totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{order.totals.shipping === 0 ? 'Free' : pkr(order.totals.shipping)}</dd>
            </div>
            {order.totals.codFee > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Cash handling</dt>
                <dd>{pkr(order.totals.codFee)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-edge pt-3 font-display text-lg">
              <dt>{order.payment.method === 'cod' ? 'Pay on delivery' : 'Paid'}</dt>
              <dd className="text-patina">{pkr(order.totals.total)}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-5 border-t border-edge pt-5 sm:grid-cols-2">
            <div>
              <h3 className="stamp">Delivering to</h3>
              <address className="mt-2 not-italic text-sm leading-relaxed text-birch/90">
                {order.customer.fullName}
                <br />
                {order.customer.address}
                <br />
                {order.customer.city} {order.customer.postal}
                <br />
                {order.customer.phone}
              </address>
            </div>
            <div>
              <h3 className="stamp">Payment</h3>
              <p className="mt-2 text-sm leading-relaxed text-birch/90">
                {order.payment.label}
                {order.payment.txnId && (
                  <>
                    <br />
                    <span className="font-mono text-xs text-muted">Ref {order.payment.txnId}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-ghost">Keep shopping</Link>
        <a
          href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi WoodHub, about order ${number}:`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Message us about this order
        </a>
      </div>
    </div>
  );
}
