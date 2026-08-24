import Link from 'next/link';
import { getDashboard, listOrders } from '@/lib/data/orders';
import { dbReady } from '@/lib/supabase';
import { pkr } from '@/lib/format';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import RevenueChart, { SplitBar } from '@/components/admin/RevenueChart';
import SeedButton from '@/components/admin/SeedButton';

export const dynamic = 'force-dynamic';

const RANGES = [7, 30, 90];

function pctChange(now: number, before: number): number | null {
  if (!before) return now > 0 ? 100 : null;
  return Math.round(((now - before) / before) * 100);
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = RANGES.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const [stats, recent] = await Promise.all([
    getDashboard(days),
    listOrders({ perPage: 8 }),
  ]);

  if (!dbReady || !stats) {
    return (
      <div className="card p-10 text-center">
        <h1 className="font-display text-2xl">Dashboard needs the database</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Once Supabase is connected and the schema has run, sales figures will appear here. You can
          push the seed catalogue into the database in one click after that.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/admin/setup" className="btn-primary btn-sm">Setup steps</Link>
        </div>
      </div>
    );
  }

  const totalOrdersInRange = Object.values(stats.by_status).reduce((a, b) => a + b, 0);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="stamp">Last {days} days</p>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">Dashboard</h1>
        </div>
        <nav aria-label="Date range" className="flex gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?days=${r}`}
              aria-current={r === days ? 'page' : undefined}
              className={`chip ${r === days ? 'chip-on' : ''}`}
            >
              {r}d
            </Link>
          ))}
        </nav>
      </header>

      {/* ---- action needed ---- */}
      {(stats.awaiting > 0 || stats.to_ship > 0) && (
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {stats.awaiting > 0 && (
            <Link
              href="/admin/orders?status=awaiting-verification"
              className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 transition-colors hover:border-amber-400"
            >
              <span className="text-sm text-birch">
                <strong>{stats.awaiting}</strong> order{stats.awaiting === 1 ? '' : 's'} waiting on
                payment verification
              </span>
              <span className="shrink-0 font-mono text-2xs uppercase tracking-stamp text-amber-300">
                Review →
              </span>
            </Link>
          )}
          {stats.to_ship > 0 && (
            <Link
              href="/admin/orders?status=confirmed"
              className="flex items-center justify-between gap-4 rounded-2xl border border-patina/40 bg-patina/10 px-5 py-4 transition-colors hover:border-patina"
            >
              <span className="text-sm text-birch">
                <strong>{stats.to_ship}</strong> order{stats.to_ship === 1 ? '' : 's'} ready to pack
                and ship
              </span>
              <span className="shrink-0 font-mono text-2xs uppercase tracking-stamp text-patina">
                Open →
              </span>
            </Link>
          )}
        </div>
      )}

      {/* ---- headline numbers ---- */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={pkr(stats.revenue)}
          delta={pctChange(stats.revenue, stats.revenue_prev)}
          sub="vs previous period"
          accent
        />
        <StatCard
          label="Orders"
          value={String(stats.orders)}
          delta={pctChange(stats.orders, stats.orders_prev)}
          sub="vs previous period"
        />
        <StatCard
          label="Average order"
          value={pkr(stats.orders ? Math.round(stats.revenue / stats.orders) : 0)}
          sub={`${stats.items_sold} items sold`}
        />
        <StatCard
          label="Customers"
          value={String(stats.customers)}
          sub={`${stats.new_customers} new this period`}
        />
      </div>

      {/* ---- chart ---- */}
      <section className="card mt-6 p-6 sm:p-7" aria-labelledby="rev-heading">
        <h2 id="rev-heading" className="stamp">
          Revenue per day
        </h2>
        <div className="mt-2">
          <RevenueChart data={stats.daily} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6 sm:p-7" aria-labelledby="pay-split">
          <h2 id="pay-split" className="stamp">
            How people paid
          </h2>
          <div className="mt-5">
            <SplitBar data={stats.by_payment} total={stats.orders} />
          </div>
        </section>

        <section className="card p-6 sm:p-7" aria-labelledby="status-split">
          <h2 id="status-split" className="stamp">
            Order status
          </h2>
          <div className="mt-5">
            <SplitBar data={stats.by_status} total={totalOrdersInRange} />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ---- top products ---- */}
        <section className="card p-6 sm:p-7" aria-labelledby="top-heading">
          <h2 id="top-heading" className="stamp">
            Best sellers this period
          </h2>
          {stats.top_products.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No sales in this period yet.</p>
          ) : (
            <ol className="mt-5 space-y-3.5">
              {stats.top_products.map((p, i) => (
                <li key={p.slug} className="flex items-center gap-3.5">
                  <span className="font-mono text-2xs text-patina">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Link
                    href={`/product/${p.slug}`}
                    className="min-w-0 flex-1 truncate text-sm hover:text-patina"
                  >
                    {p.name}
                  </Link>
                  <span className="shrink-0 font-mono text-2xs text-muted">{p.qty} sold</span>
                  <span className="shrink-0 font-mono text-sm">{pkr(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ---- low stock ---- */}
        <section className="card p-6 sm:p-7" aria-labelledby="stock-heading">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="stock-heading" className="stamp">
              Running low
            </h2>
            <Link href="/admin/products" className="font-mono text-2xs uppercase tracking-stamp text-patina">
              All products
            </Link>
          </div>
          {stats.low_stock.length === 0 ? (
            <p className="mt-5 text-sm text-muted">Everything is comfortably in stock.</p>
          ) : (
            <ul className="mt-5 space-y-3.5">
              {stats.low_stock.map((p) => (
                <li key={p.slug} className="flex items-center gap-3.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      p.stock === 0 ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <span
                    className={`shrink-0 font-mono text-2xs ${
                      p.stock === 0 ? 'text-red-400' : 'text-amber-300'
                    }`}
                  >
                    {p.stock === 0 ? 'Sold out' : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ---- recent orders ---- */}
      <section className="card mt-6 p-6 sm:p-7" aria-labelledby="recent-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="recent-heading" className="stamp">
            Latest orders
          </h2>
          <Link href="/admin/orders" className="font-mono text-2xs uppercase tracking-stamp text-patina">
            All orders
          </Link>
        </div>

        {recent.orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-edge px-5 py-10 text-center">
            <p className="text-sm text-muted">No orders yet.</p>
            <div className="mt-5">
              <SeedButton />
            </div>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-edge">
            {recent.orders.map((o) => (
              <li key={o.order_number}>
                <Link
                  href={`/admin/orders/${o.order_number}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5 transition-colors hover:text-patina"
                >
                  <span className="font-mono text-sm">{o.order_number}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted">
                    {o.customer.fullName} · {o.customer.city}
                  </span>
                  <StatusBadge status={o.status} />
                  <span className="font-mono text-sm">{pkr(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
