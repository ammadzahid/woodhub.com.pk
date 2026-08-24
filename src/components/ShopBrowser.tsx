'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES, PRICE_BANDS, WOOD_TYPES, type Product } from '@/lib/catalog';
import ProductCard from '@/components/ProductCard';
import { cx } from '@/lib/format';

type SortId = 'featured' | 'popular' | 'price-asc' | 'price-desc' | 'rating';

const SORTS: { id: SortId; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'popular', label: 'Most reviewed' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Best rated' },
];

export default function ShopBrowser({
  products,
  lockedCategory,
}: {
  products: Product[];
  lockedCategory?: string;
}) {
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get('q') || '');
  const [cats, setCats] = useState<string[]>(
    lockedCategory ? [lockedCategory] : params.get('cat') ? params.get('cat')!.split(',') : [],
  );
  const [woods, setWoods] = useState<string[]>([]);
  const [band, setBand] = useState<string>('');
  const [saleOnly, setSaleOnly] = useState(params.get('sale') === '1');
  const [sort, setSort] = useState<SortId>((params.get('sort') as SortId) || 'featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* keep the URL shareable without re-rendering the whole tree */
  useEffect(() => {
    if (lockedCategory) return;
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (cats.length) next.set('cat', cats.join(','));
    if (saleOnly) next.set('sale', '1');
    if (sort !== 'featured') next.set('sort', sort);
    const qs = next.toString();
    const url = qs ? `/shop?${qs}` : '/shop';
    window.history.replaceState(null, '', url);
  }, [query, cats, saleOnly, sort, lockedCategory]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cats.length && !cats.includes(p.category)) return false;
      if (woods.length && !woods.includes(p.wood)) return false;
      if (saleOnly && !p.compareAt) return false;
      if (band) {
        const b = PRICE_BANDS.find((x) => x.id === band);
        if (b && (p.price < b.min || p.price > b.max)) return false;
      }
      if (q) {
        const haystack = `${p.name} ${p.wood} ${p.finish} ${p.description} ${p.category}`.toLowerCase();
        if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
      }
      return true;
    });

    list = [...list];
    switch (sort) {
      case 'popular':
        list.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.reviews - a.reviews);
    }
    return list;
  }, [products, query, cats, woods, band, saleOnly, sort]);

  const activeCount =
    cats.length * (lockedCategory ? 0 : 1) + woods.length + (band ? 1 : 0) + (saleOnly ? 1 : 0);

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function clearAll() {
    setQuery('');
    setCats(lockedCategory ? [lockedCategory] : []);
    setWoods([]);
    setBand('');
    setSaleOnly(false);
  }

  return (
    <div>
      {/* ---- search + sort bar ---- */}
      <div className="sticky top-16 z-30 -mx-5 mb-8 border-b border-edge bg-ink/92 px-5 py-3.5 backdrop-blur-xl sm:-mx-7 sm:px-7 lg:top-20 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <svg
              width="17"
              height="17"
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shelves, boards, lamps…"
              aria-label="Search products"
              className="!py-3 !pl-11 !pr-4"
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={cx(
              'btn btn-sm shrink-0 border px-4 py-3',
              activeCount > 0 ? 'border-patina text-patina' : 'border-edge text-birch',
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            Filters
            {activeCount > 0 && (
              <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-patina px-1 font-mono text-2xs font-bold text-ink">
                {activeCount}
              </span>
            )}
          </button>

          <label className="sr-only" htmlFor="sort">Sort products</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className="!w-auto shrink-0 !py-3 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {filtersOpen && (
          <div className="animate-fade pt-4">
            {!lockedCategory && (
              <FilterRow label="Room">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggle(cats, setCats, c.slug)}
                    className={cx('chip', cats.includes(c.slug) && 'chip-on')}
                  >
                    {c.label}
                  </button>
                ))}
              </FilterRow>
            )}

            <FilterRow label="Wood">
              {WOOD_TYPES.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggle(woods, setWoods, w)}
                  className={cx('chip', woods.includes(w) && 'chip-on')}
                >
                  {w}
                </button>
              ))}
            </FilterRow>

            <FilterRow label="Price">
              {PRICE_BANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBand(band === b.id ? '' : b.id)}
                  className={cx('chip', band === b.id && 'chip-on')}
                >
                  {b.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSaleOnly((v) => !v)}
                className={cx('chip', saleOnly && 'chip-on')}
              >
                Reduced only
              </button>
            </FilterRow>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-3 font-mono text-2xs uppercase tracking-stamp text-patina underline underline-offset-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mb-7 stamp" aria-live="polite">
        {results.length} {results.length === 1 ? 'piece' : 'pieces'}
        {query && ` matching “${query}”`}
      </p>

      {results.length === 0 ? (
        <div className="card px-7 py-16 text-center">
          <h2 className="font-display text-2xl">Nothing matches that yet</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Try a shorter search, or drop a filter. We add new pieces to the bench every few weeks.
          </p>
          <button type="button" onClick={clearAll} className="btn-primary btn-sm mt-7">
            Show everything
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
          {results.map((p, i) => (
            <li key={p.slug} className="h-full">
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5">
      <span className="stamp w-14 shrink-0">{label}</span>
      {children}
    </div>
  );
}
