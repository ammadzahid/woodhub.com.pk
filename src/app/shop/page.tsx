import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/data/products';
import { buildMeta, breadcrumbSchema, itemListSchema } from '@/lib/seo';
import ShopBrowser from '@/components/ShopBrowser';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildMeta({
  title: 'Shop All Wooden Decor — 45 Handmade Pieces',
  description:
    'Browse every WoodHub piece: wooden wall art, floating shelves, serving boards, desk organisers, lamps and engraved gifts in sheesham, walnut, acacia and mango wood. Filter by room, wood and price. Cash on delivery across Pakistan.',
  path: '/shop',
  keywords: [
    'buy wooden decor online Pakistan',
    'wooden wall shelf price in Pakistan',
    'handmade wooden products Lahore',
    'sheesham decor online',
  ],
});

export const revalidate = 300;

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
          ]),
          itemListSchema(products, 'All WoodHub pieces'),
        ]}
      />

      <div className="shell py-12 lg:py-16">
        <header className="max-w-2xl">
          <p className="stamp">Everything on the bench</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            All {products.length} pieces
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Filter by the room it is going into, the wood you want, or what you are willing to
            spend. Every listing shows the exact dimensions and finish before you add it.
          </p>
        </header>

        <div className="mt-10">
          <Suspense fallback={<p className="stamp">Loading the catalogue…</p>}>
            <ShopBrowser products={products} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
