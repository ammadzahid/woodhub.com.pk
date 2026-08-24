'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Category, Product } from '@/lib/catalog';
import { pkr } from '@/lib/format';

type Draft = Partial<Product> & { active: boolean };

const EMPTY: Draft = {
  slug: '',
  name: '',
  category: 'wall-decor',
  price: 0,
  compareAt: null,
  wood: 'Sheesham',
  dimensions: '',
  finish: 'Matte lacquer',
  woodNote: '',
  description: '',
  features: [],
  rating: 5,
  reviews: 0,
  stock: 0,
  sku: '',
  image: '',
  featured: false,
  personalised: false,
  active: true,
};

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product & { active: boolean };
  categories: Category[];
}) {
  const router = useRouter();
  const isNew = !product;
  const [draft, setDraft] = useState<Draft>(product ? { ...product } : EMPTY);
  const [featureText, setFeatureText] = useState((product?.features ?? []).join('\n'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setError(null);

    const payload = {
      ...draft,
      features: featureText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      price: Number(draft.price) || 0,
      compareAt: draft.compareAt ? Number(draft.compareAt) : null,
      stock: Number(draft.stock) || 0,
      rating: Number(draft.rating) || 5,
      reviews: Number(draft.reviews) || 0,
    };

    try {
      const res = await fetch(
        isNew ? '/api/admin/products' : `/api/admin/products/${product!.id}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save.');
        setBusy(false);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Could not reach the server.');
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product!.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Delete failed.');
        setBusy(false);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Could not reach the server.');
      setBusy(false);
    }
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-muted hover:text-patina"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H6M12 5l-7 7 7 7" />
          </svg>
          All products
        </Link>
      </nav>

      <h1 className="font-display text-3xl leading-tight sm:text-4xl">
        {isNew ? 'Add a product' : draft.name || 'Edit product'}
      </h1>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-birch">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6 sm:p-7">
            <h2 className="stamp">The basics</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="name" label="Product name">
                  <input id="name" value={draft.name ?? ''} onChange={(e) => set('name', e.target.value)} />
                </Field>
              </div>
              <Field id="slug" label="URL slug" hint="woodhub.pk/product/…">
                <input
                  id="slug"
                  value={draft.slug ?? ''}
                  onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                />
              </Field>
              <Field id="sku" label="SKU">
                <input id="sku" value={draft.sku ?? ''} onChange={(e) => set('sku', e.target.value)} />
              </Field>
              <Field id="category" label="Category">
                <select
                  id="category"
                  value={draft.category}
                  onChange={(e) => set('category', e.target.value as Product['category'])}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.title}</option>
                  ))}
                </select>
              </Field>
              <Field id="image" label="Image path" hint="/products/your-file.jpg">
                <input id="image" value={draft.image ?? ''} onChange={(e) => set('image', e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="description" label="Description" hint="Shown on the product page and in search results">
                  <textarea
                    id="description"
                    rows={4}
                    value={draft.description ?? ''}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="card p-6 sm:p-7">
            <h2 className="stamp">Specification</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field id="wood" label="Wood">
                <input id="wood" value={draft.wood ?? ''} onChange={(e) => set('wood', e.target.value)} />
              </Field>
              <Field id="dimensions" label="Dimensions">
                <input id="dimensions" value={draft.dimensions ?? ''} onChange={(e) => set('dimensions', e.target.value)} />
              </Field>
              <Field id="finish" label="Finish">
                <input id="finish" value={draft.finish ?? ''} onChange={(e) => set('finish', e.target.value)} />
              </Field>
              <div className="sm:col-span-3">
                <Field id="woodNote" label="Note about this wood">
                  <textarea id="woodNote" rows={2} value={draft.woodNote ?? ''} onChange={(e) => set('woodNote', e.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field id="features" label="Selling points" hint="One per line">
                  <textarea
                    id="features"
                    rows={4}
                    value={featureText}
                    onChange={(e) => setFeatureText(e.target.value)}
                    placeholder={'Carved from one solid round\nKeyhole mount pre-fitted'}
                  />
                </Field>
              </div>
            </div>
          </section>
        </div>

        {/* ---- side rail ---- */}
        <div className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <section className="card p-6">
            <h2 className="stamp">Price and stock</h2>
            <div className="mt-5 space-y-4">
              <Field id="price" label="Price (PKR)">
                <input id="price" type="number" min={0} value={draft.price ?? 0} onChange={(e) => set('price', Number(e.target.value))} />
              </Field>
              <Field id="compareAt" label="Was price" hint="Blank if not reduced">
                <input
                  id="compareAt"
                  type="number"
                  min={0}
                  value={draft.compareAt ?? ''}
                  onChange={(e) => set('compareAt', e.target.value ? Number(e.target.value) : null)}
                />
              </Field>
              <Field id="stock" label="Stock">
                <input id="stock" type="number" min={0} value={draft.stock ?? 0} onChange={(e) => set('stock', Number(e.target.value))} />
              </Field>
              {Number(draft.price) > 0 && (
                <p className="stamp">
                  {pkr(Number(draft.price) * Number(draft.stock || 0))} of stock at this price
                </p>
              )}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="stamp">Visibility</h2>
            <div className="mt-4 space-y-2.5">
              <Toggle label="Live on the shop" checked={draft.active} onChange={(v) => set('active', v)} />
              <Toggle label="Featured on the homepage" checked={Boolean(draft.featured)} onChange={(v) => set('featured', v)} />
              <Toggle label="Accepts engraving" checked={Boolean(draft.personalised)} onChange={(v) => set('personalised', v)} />
            </div>
          </section>

          {draft.image && (
            <section className="card overflow-hidden">
              <div className="relative aspect-[4/5]">
                <Image src={draft.image} alt="" fill sizes="320px" className="object-cover" />
              </div>
            </section>
          )}

          <div className="space-y-3">
            <button type="button" onClick={save} disabled={busy} className="btn-primary w-full">
              {busy ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
            </button>

            {!isNew && (
              confirmDelete ? (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
                  <p className="text-sm text-birch">Delete this product permanently?</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={remove} disabled={busy} className="btn btn-sm flex-1 border border-red-500/50 text-red-300">
                      Yes, delete
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="btn-ghost btn-sm flex-1">
                      Keep it
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-full border border-edge px-5 py-3 text-sm text-muted transition-colors hover:border-red-500/50 hover:text-red-300"
                >
                  Delete product
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-edge px-4 py-3 transition-colors hover:border-muted/50">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-patina' : 'bg-edge'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-transform ${
            checked ? 'translate-x-[1.4rem]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </label>
  );
}
