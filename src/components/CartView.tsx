'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { pkr } from '@/lib/format';
import { SHIPPING } from '@/lib/site';
import { LineSkeleton, PanelSkeleton } from './Skeleton';

export default function CartView() {
  const { lines, subtotal, shipping, freeShippingGap, count, setQty, remove, ready } = useCart();

  if (!ready) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        <LineSkeleton />
        <PanelSkeleton />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="card px-7 py-20 text-center">
        <h2 className="font-display text-3xl">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Nothing in here yet. The shelves and boards are the usual place people start.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">Browse all pieces</Link>
          <Link href="/collections/shelves" className="btn-ghost">See the shelves</Link>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, (subtotal / SHIPPING.freeOver) * 100);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
      <div>
        {/* free delivery progress */}
        <div className="card mb-7 p-5">
          {freeShippingGap > 0 ? (
            <p className="text-sm text-birch/90">
              Add <strong className="text-patina">{pkr(freeShippingGap)}</strong> more and delivery
              is free.
            </p>
          ) : (
            <p className="text-sm text-patina">Delivery on this order is free.</p>
          )}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-edge">
            <div
              className="h-full rounded-full bg-patina transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ul className="divide-y divide-edge border-y border-edge">
          {lines.map((line) => (
            <li key={line.slug} className="flex gap-4 py-5 sm:gap-6">
              <Link
                href={`/product/${line.slug}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-edge bg-raise sm:h-28 sm:w-24"
              >
                <Image
                  src={line.product.image}
                  alt={line.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base sm:text-lg">
                      <Link href={`/product/${line.slug}`} className="hover:text-patina">
                        {line.product.name}
                      </Link>
                    </h2>
                    <p className="mt-1 stamp truncate">
                      {line.product.wood} · {line.product.dimensions}
                    </p>
                    {line.engraving && (
                      <p className="mt-1.5 font-mono text-2xs text-patina">
                        Engraving: “{line.engraving}”
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-right font-display text-base sm:text-lg">
                    {pkr(line.lineTotal)}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                  <div className="flex items-center rounded-full border border-edge">
                    <button
                      type="button"
                      aria-label={`Reduce quantity of ${line.product.name}`}
                      onClick={() => setQty(line.slug, line.qty - 1)}
                      className="grid h-9 w-9 place-items-center rounded-l-full text-muted transition-colors hover:text-patina"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14" /></svg>
                    </button>
                    <span className="w-8 text-center font-mono text-sm">{line.qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${line.product.name}`}
                      onClick={() => setQty(line.slug, line.qty + 1)}
                      className="grid h-9 w-9 place-items-center rounded-r-full text-muted transition-colors hover:text-patina"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(line.slug)}
                    className="font-mono text-2xs uppercase tracking-stamp text-muted transition-colors hover:text-patina"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/shop"
          className="mt-7 inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-patina"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H6M12 5l-7 7 7 7" />
          </svg>
          Keep shopping
        </Link>
      </div>

      {/* ---- summary ---- */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-7">
          <h2 className="font-display text-xl">Order summary</h2>

          <dl className="mt-6 space-y-3.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal ({count} {count === 1 ? 'item' : 'items'})</dt>
              <dd>{pkr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{shipping === 0 ? <span className="text-patina">Free</span> : pkr(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-edge pt-3.5 font-display text-lg">
              <dt>Total</dt>
              <dd className="text-patina">{pkr(subtotal + shipping)}</dd>
            </div>
          </dl>

          <p className="mt-3 stamp">Cash on delivery adds {pkr(SHIPPING.codFee)} at checkout</p>

          <Link href="/checkout" className="btn-primary mt-7 w-full">
            Checkout
          </Link>

          <ul className="mt-6 space-y-2.5 stamp">
            {['Cash on delivery available', '7-day returns', 'Dispatch within 1 working day'].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#57C3A7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
