import Link from 'next/link';
import { pkr, orderDate } from '@/lib/format';
import type { OrderRecord } from '@/lib/data/orders';
import { ORDER_STATUSES } from '@/lib/data/orders';

export default function OrderHistory({
  orders,
  signedIn,
}: {
  orders: OrderRecord[];
  signedIn: boolean;
}) {
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="font-display text-2xl sm:text-3xl">
        Your orders
      </h2>

      {!signedIn ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Sign in above and any order placed with that email will show up here.
        </p>
      ) : orders.length === 0 ? (
        <div className="card mt-6 px-6 py-12 text-center">
          <p className="text-sm text-muted">
            Nothing here yet. Orders you place appear the moment they go through.
          </p>
          <Link href="/shop" className="btn-primary btn-sm mt-6">
            Browse the shop
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => {
            const meta = ORDER_STATUSES.find((s) => s.id === o.status);
            return (
              <li key={o.order_number} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-patina">{o.order_number}</p>
                    <p className="mt-1 stamp">
                      {orderDate(o.created_at)} · {o.item_count} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg">{pkr(o.total)}</p>
                    <p className="mt-1 stamp">{meta?.label ?? o.status}</p>
                  </div>
                </div>

                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-edge pt-4">
                  {o.lines.map((l) => (
                    <li key={l.slug + l.engraving} className="text-sm text-muted">
                      <Link href={`/product/${l.slug}`} className="hover:text-patina">
                        {l.qty} × {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {o.tracking_number && (
                  <p className="mt-4 font-mono text-2xs uppercase tracking-stamp text-patina">
                    Tracking: {o.tracking_number}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
