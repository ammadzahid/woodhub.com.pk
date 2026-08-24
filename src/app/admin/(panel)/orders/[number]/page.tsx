import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/data/orders';
import { pkr, orderDate } from '@/lib/format';
import { SITE } from '@/lib/site';
import StatusBadge from '@/components/admin/StatusBadge';
import OrderControls from '@/components/admin/OrderControls';

export const dynamic = 'force-dynamic';

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const order = await getOrder(decodeURIComponent(number));
  if (!order) notFound();

  const needsVerification = order.payment_method !== 'cod' && !order.payment_verified_at;

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-muted hover:text-patina">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H6M12 5l-7 7 7 7" />
          </svg>
          All orders
        </Link>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl leading-none sm:text-4xl">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-3 stamp">
            Placed {orderDate(order.created_at)} · {order.item_count} items · {pkr(order.total)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`https://wa.me/${order.customer.phone.replace(/^0/, '92').replace(/\D/g, '')}?text=${encodeURIComponent(
              `Hi ${order.customer.fullName.split(' ')[0]}, this is WoodHub about your order ${order.order_number}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn-sm"
          >
            WhatsApp customer
          </a>
          <a href={`tel:${order.customer.phone}`} className="btn-ghost btn-sm">
            Call
          </a>
        </div>
      </header>

      {needsVerification && (
        <div className="mt-7 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
          <p className="text-sm text-birch">
            <strong className="font-semibold">Payment not verified.</strong> The customer says they
            sent {pkr(order.total)} by {order.payment_method} with reference{' '}
            <span className="font-mono text-patina">{order.payment_txn_id || '—'}</span>. Check your
            account, then mark it verified below.
          </p>
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* ---- items ---- */}
          <section className="card p-6 sm:p-7" aria-labelledby="items-heading">
            <h2 id="items-heading" className="stamp">
              Items
            </h2>
            <ul className="mt-5 divide-y divide-edge border-y border-edge">
              {order.lines.map((l) => (
                <li key={l.slug + l.engraving} className="flex justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <Link href={`/product/${l.slug}`} className="text-sm hover:text-patina">
                      {l.name}
                    </Link>
                    <p className="mt-1 stamp">
                      {l.sku} · {l.qty} × {pkr(l.unitPrice)}
                    </p>
                    {l.engraving && (
                      <p className="mt-1.5 rounded-lg border border-patina/30 bg-patina/10 px-2.5 py-1 font-mono text-2xs text-patina">
                        Engrave: “{l.engraving}”
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 font-mono text-sm">{pkr(l.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 text-sm">
              <Row k="Subtotal" v={pkr(order.subtotal)} />
              <Row k="Delivery" v={order.shipping === 0 ? 'Free' : pkr(order.shipping)} />
              {order.cod_fee > 0 && <Row k="Cash handling" v={pkr(order.cod_fee)} />}
              <div className="flex justify-between border-t border-edge pt-3 font-display text-lg">
                <dt>Total</dt>
                <dd className="text-patina">{pkr(order.total)}</dd>
              </div>
            </dl>
          </section>

          {/* ---- customer ---- */}
          <section className="card p-6 sm:p-7" aria-labelledby="cust-heading">
            <h2 id="cust-heading" className="stamp">
              Delivery details
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field k="Name" v={order.customer.fullName} />
              <Field k="Phone" v={order.customer.phone} mono />
              <Field k="Email" v={order.customer.email} />
              <Field k="City" v={`${order.customer.city} ${order.customer.postal}`.trim()} />
              <div className="sm:col-span-2">
                <Field k="Address" v={order.customer.address} />
              </div>
              {order.customer.notes && (
                <div className="sm:col-span-2">
                  <Field k="Notes for the rider" v={order.customer.notes} />
                </div>
              )}
            </dl>
          </section>

          {/* ---- payment ---- */}
          <section className="card p-6 sm:p-7" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="stamp">
              Payment
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field k="Method" v={order.payment_method.replace(/-/g, ' ')} />
              <Field k="Reference" v={order.payment_txn_id || '—'} mono />
              <Field
                k="Verified"
                v={order.payment_verified_at ? orderDate(order.payment_verified_at) : 'Not yet'}
              />
              <Field k="Account" v={order.account_sub ? 'Signed in with Google' : 'Guest checkout'} />
            </dl>
          </section>
        </div>

        {/* ---- controls ---- */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <OrderControls
            orderNumber={order.order_number}
            status={order.status}
            notes={order.admin_notes}
            tracking={order.tracking_number}
            verified={Boolean(order.payment_verified_at)}
            needsVerification={order.payment_method !== 'cod'}
          />

          <p className="mt-5 px-1 text-xs leading-relaxed text-muted">
            Cancelling an order puts its stock back automatically. Un-cancelling takes it out again.
            Questions from the customer go to {SITE.email}.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Field({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="stamp">{k}</dt>
      <dd className={`mt-1.5 text-sm capitalize text-birch/90 ${mono ? 'font-mono normal-case' : ''}`}>
        {v || '—'}
      </dd>
    </div>
  );
}
