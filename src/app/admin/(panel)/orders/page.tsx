import Link from 'next/link';
import { listOrders, ORDER_STATUSES, type OrderStatus } from '@/lib/data/orders';
import { dbReady } from '@/lib/supabase';
import { pkr, orderDate } from '@/lib/format';
import { PAYMENT_METHODS } from '@/lib/site';
import StatusBadge from '@/components/admin/StatusBadge';
import OrderFilters from '@/components/admin/OrderFilters';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = (ORDER_STATUSES.some((s) => s.id === sp.status) ? sp.status : '') as
    | OrderStatus
    | '';
  const payment = PAYMENT_METHODS.some((m) => m.id === sp.payment) ? sp.payment! : '';

  const { orders, total } = await listOrders({
    status,
    payment,
    search: sp.q ?? '',
    page,
    perPage: PER_PAGE,
  });

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const qs = (patch: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (sp.q) params.set('q', sp.q);
    if (status) params.set('status', status);
    if (payment) params.set('payment', payment);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === 0) params.delete(k);
      else params.set(k, String(v));
    });
    const s = params.toString();
    return s ? `/admin/orders?${s}` : '/admin/orders';
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="stamp">{total} total</p>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">Orders</h1>
        </div>
      </header>

      <div className="mt-7">
        <OrderFilters status={status} payment={payment} query={sp.q ?? ''} />
      </div>

      {!dbReady ? (
        <div className="card mt-7 px-6 py-14 text-center">
          <h2 className="font-display text-xl">No database connected</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
            Orders are not being stored yet. Connect Supabase and they will start appearing here.
          </p>
          <Link href="/admin/setup" className="btn-primary btn-sm mt-6">
            Setup steps
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="card mt-7 px-6 py-14 text-center">
          <h2 className="font-display text-xl">Nothing matches</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
            Try clearing the filters, or search by order number, name or phone.
          </p>
          <Link href="/admin/orders" className="btn-ghost btn-sm mt-6">
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          {/* desktop table */}
          <div className="card mt-7 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-edge">
                  {['Order', 'Customer', 'Payment', 'Status', 'Total', 'Placed'].map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-5 py-3.5 stamp">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {orders.map((o) => (
                  <tr key={o.order_number} className="transition-colors hover:bg-raise/50">
                    <td className="whitespace-nowrap px-5 py-4">
                      <Link href={`/admin/orders/${o.order_number}`} className="font-mono hover:text-patina">
                        {o.order_number}
                      </Link>
                      <span className="mt-1 block stamp">{o.item_count} items</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block max-w-[16rem] truncate">{o.customer.fullName}</span>
                      <span className="mt-1 block stamp">
                        {o.customer.city} · {o.customer.phone}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="capitalize">{o.payment_method.replace(/-/g, ' ')}</span>
                      {o.payment_txn_id && (
                        <span className="mt-1 block font-mono text-2xs text-muted">
                          {o.payment_verified_at ? '✓ verified' : 'ref ' + o.payment_txn_id}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono">{pkr(o.total)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {orderDate(o.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <ul className="mt-7 space-y-3 md:hidden">
            {orders.map((o) => (
              <li key={o.order_number}>
                <Link href={`/admin/orders/${o.order_number}`} className="block card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-sm">{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-2.5 truncate text-sm">{o.customer.fullName}</p>
                  <p className="mt-1 stamp">
                    {o.customer.city} · {o.item_count} items · {orderDate(o.created_at)}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="stamp capitalize">{o.payment_method.replace(/-/g, ' ')}</span>
                    <span className="font-display text-lg text-patina">{pkr(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
              <Link
                href={qs({ page: Math.max(1, page - 1) })}
                aria-disabled={page <= 1}
                className={`btn-ghost btn-sm ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
              >
                Previous
              </Link>
              <span className="stamp">
                Page {page} of {pages}
              </span>
              <Link
                href={qs({ page: Math.min(pages, page + 1) })}
                aria-disabled={page >= pages}
                className={`btn-ghost btn-sm ${page >= pages ? 'pointer-events-none opacity-40' : ''}`}
              >
                Next
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
