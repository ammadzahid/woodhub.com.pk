import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts, getCategories } from '@/lib/data/products';
import { dbReady } from '@/lib/supabase';
import { pkr } from '@/lib/format';
import StockCell from '@/components/admin/StockCell';
import SeedButton from '@/components/admin/SeedButton';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; low?: string }>;
}) {
  const sp = await searchParams;
  const [all, categories] = await Promise.all([getAllProducts(), getCategories()]);

  const q = (sp.q ?? '').trim().toLowerCase();
  const products = all.filter((p) => {
    if (sp.cat && p.category !== sp.cat) return false;
    if (sp.low === '1' && p.stock > 5) return false;
    if (q && !`${p.name} ${p.sku} ${p.wood} ${p.slug}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const lowCount = all.filter((p) => p.stock <= 5).length;
  const inventoryValue = all.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="stamp">
            {all.length} products · {pkr(inventoryValue)} of stock on hand
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">Products</h1>
        </div>
        {dbReady && (
          <Link href="/admin/products/new" className="btn-primary btn-sm">
            Add a product
          </Link>
        )}
      </header>

      {!dbReady && (
        <div className="card mt-7 p-6">
          <h2 className="font-display text-lg">Read-only until the database is connected</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            These are the seed products from <code className="font-mono text-2xs text-patina">catalog.ts</code>.
            Connect Supabase to edit prices and stock from here instead of in code.
          </p>
        </div>
      )}

      {/* filters */}
      <form className="card mt-7 p-5" action="/admin/products">
        <div className="flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Search name, SKU or wood"
            aria-label="Search products"
            className="!py-3"
          />
          <button type="submit" className="btn-primary btn-sm shrink-0 !py-3">
            Search
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href="/admin/products" className={`chip ${!sp.cat && sp.low !== '1' ? 'chip-on' : ''}`}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/admin/products?cat=${c.slug}`}
              className={`chip ${sp.cat === c.slug ? 'chip-on' : ''}`}
            >
              {c.label}
            </Link>
          ))}
          <Link href="/admin/products?low=1" className={`chip ${sp.low === '1' ? 'chip-on' : ''}`}>
            Low stock ({lowCount})
          </Link>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="card mt-7 px-6 py-14 text-center">
          <h2 className="font-display text-xl">Nothing here</h2>
          {dbReady && all.length === 0 ? (
            <>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
                The database is empty. Push the seed catalogue in and you are ready to trade.
              </p>
              <div className="mt-6 flex justify-center">
                <SeedButton />
              </div>
            </>
          ) : (
            <Link href="/admin/products" className="btn-ghost btn-sm mt-5">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="card mt-7 overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-edge">
                {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map((h, i) => (
                  <th key={i} scope="col" className="whitespace-nowrap px-5 py-3.5 stamp">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-raise/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3.5">
                      <span className="relative h-12 w-11 shrink-0 overflow-hidden rounded-lg border border-edge bg-raise">
                        {p.image && (
                          <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[18rem] truncate">{p.name}</span>
                        <span className="mt-0.5 block stamp">
                          {p.sku} · {p.wood}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 capitalize text-muted">
                    {p.category.replace(/-/g, ' ')}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className="font-mono">{pkr(p.price)}</span>
                    {p.compareAt && (
                      <span className="mt-0.5 block font-mono text-2xs text-muted line-through">
                        {pkr(p.compareAt)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StockCell id={p.id} stock={p.stock} editable={dbReady} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span
                      className={`rounded-full border px-2.5 py-1 font-mono text-2xs uppercase tracking-stamp ${
                        p.active
                          ? 'border-patina/40 bg-patina/10 text-patina'
                          : 'border-edge text-muted'
                      }`}
                    >
                      {p.active ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    {dbReady ? (
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-mono text-2xs uppercase tracking-stamp text-patina"
                      >
                        Edit
                      </Link>
                    ) : (
                      <Link
                        href={`/product/${p.slug}`}
                        className="font-mono text-2xs uppercase tracking-stamp text-muted"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
