import Link from 'next/link';
import { listCustomers } from '@/lib/data/orders';
import { dbReady } from '@/lib/supabase';
import { pkr, orderDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

const PER_PAGE = 30;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { customers, total } = await listCustomers(sp.q ?? '', page, PER_PAGE);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  const lifetime = customers.reduce((s, c) => s + c.total_spent, 0);
  const repeat = customers.filter((c) => c.orders_count > 1).length;

  return (
    <div>
      <header>
        <p className="stamp">{total} total</p>
        <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">Customers</h1>
      </header>

      {!dbReady ? (
        <div className="card mt-7 px-6 py-14 text-center">
          <h2 className="font-display text-xl">No database connected</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
            Customer records are created automatically from orders once Supabase is connected.
          </p>
          <Link href="/admin/setup" className="btn-primary btn-sm mt-6">Setup steps</Link>
        </div>
      ) : (
        <>
          {customers.length > 0 && (
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="card p-5">
                <p className="stamp">On this page</p>
                <p className="mt-2.5 font-display text-2xl">{customers.length}</p>
              </div>
              <div className="card p-5">
                <p className="stamp">Combined spend</p>
                <p className="mt-2.5 font-display text-2xl text-patina">{pkr(lifetime)}</p>
              </div>
              <div className="card p-5">
                <p className="stamp">Ordered more than once</p>
                <p className="mt-2.5 font-display text-2xl">{repeat}</p>
              </div>
            </div>
          )}

          <form className="card mt-6 p-5" action="/admin/customers">
            <div className="flex gap-3">
              <input
                type="search"
                name="q"
                defaultValue={sp.q ?? ''}
                placeholder="Search name, email, phone or city"
                aria-label="Search customers"
                className="!py-3"
              />
              <button type="submit" className="btn-primary btn-sm shrink-0 !py-3">Search</button>
            </div>
          </form>

          {customers.length === 0 ? (
            <div className="card mt-7 px-6 py-14 text-center">
              <h2 className="font-display text-xl">No customers yet</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
                A customer record is created the first time somebody places an order.
              </p>
            </div>
          ) : (
            <div className="card mt-6 overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-edge">
                    {['Customer', 'City', 'Orders', 'Spent', 'Last order'].map((h) => (
                      <th key={h} scope="col" className="whitespace-nowrap px-5 py-3.5 stamp">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {customers.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-raise/50">
                      <td className="px-5 py-4">
                        <span className="block max-w-[16rem] truncate">{c.name || '—'}</span>
                        <span className="mt-1 block font-mono text-2xs text-muted">{c.email}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted">{c.city || '—'}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          href={`/admin/orders?q=${encodeURIComponent(c.email)}`}
                          className="font-mono hover:text-patina"
                        >
                          {c.orders_count}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono">{pkr(c.total_spent)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted">
                        {c.last_order_at ? orderDate(c.last_order_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
              <Link
                href={`/admin/customers?page=${Math.max(1, page - 1)}${sp.q ? `&q=${sp.q}` : ''}`}
                className={`btn-ghost btn-sm ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
              >
                Previous
              </Link>
              <span className="stamp">Page {page} of {pages}</span>
              <Link
                href={`/admin/customers?page=${Math.min(pages, page + 1)}${sp.q ? `&q=${sp.q}` : ''}`}
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
