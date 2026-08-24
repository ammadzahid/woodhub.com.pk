import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';

import { getCategories, getCategory, getProductsByCategory } from '@/lib/data/products';
import { buildMeta, collectionSchema, breadcrumbSchema, itemListSchema } from '@/lib/seo';
import ShopBrowser from '@/components/ShopBrowser';
import JsonLd from '@/components/JsonLd';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

const SEO_COPY: Record<string, { title: string; description: string; keywords: string[] }> = {
  'wall-decor': {
    title: 'Wooden Wall Art & Decor in Pakistan',
    description:
      'Hand-carved wooden wall art, mandalas, jali panels and wall clocks in solid sheesham, walnut and mango wood. Made in Lahore, delivered nationwide with cash on delivery.',
    keywords: ['wooden wall art Pakistan', 'wall decor online Pakistan', 'carved wooden panel price', 'jali panel Lahore'],
  },
  shelves: {
    title: 'Wooden Wall Shelves & Floating Shelves',
    description:
      'Solid wood floating shelves, hexagon shelves, corner units and book ledges with concealed brackets. Anchors, screws and a drilling template in every box.',
    keywords: ['wooden wall shelf price in Pakistan', 'floating shelf online Pakistan', 'hexagon shelf Lahore', 'corner shelf wooden'],
  },
  kitchen: {
    title: 'Wooden Chopping Boards, Trays & Coasters',
    description:
      'Food-safe acacia and walnut chopping boards, serving trays, platters and end-grain coasters. Oiled, not lacquered, and built for daily use.',
    keywords: ['wooden chopping board Pakistan', 'serving tray wooden online', 'acacia charcuterie board price', 'wooden coasters Pakistan'],
  },
  desk: {
    title: 'Wooden Desk Organisers & Office Accessories',
    description:
      'Wooden desk organisers, phone docks, laptop risers, pen holders and file trays in sheesham and walnut. Clears the clutter without adding plastic.',
    keywords: ['wooden desk organizer Pakistan', 'laptop stand wooden price', 'wooden pen holder online', 'office desk accessories Pakistan'],
  },
  lighting: {
    title: 'Wooden Lamps, Sconces & Pendant Lights',
    description:
      'Hand-turned wooden table lamps, night lamps, wall sconces, pendant shades and floor lamps. Warm light, solid wood bases, plug-and-play wiring.',
    keywords: ['wooden lamp Pakistan', 'night lamp online Pakistan', 'wooden pendant light price', 'table lamp wooden Lahore'],
  },
  gifts: {
    title: 'Engraved Wooden Gifts & Personalised Name Plates',
    description:
      'Personalised wooden name plates, engraved photo frames, keychain sets and wedding keepsake boxes. Engraved the same working day, delivered across Pakistan.',
    keywords: ['engraved wooden gifts Pakistan', 'personalised name plate online', 'wooden wedding gift box', 'custom engraved gifts Lahore'],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return buildMeta({ title: 'Not found', description: '', path: '/shop', noindex: true });

  const seo = SEO_COPY[slug];
  const count = (await getProductsByCategory(category.slug)).length;

  return buildMeta({
    title: seo?.title ?? category.title,
    description: seo?.description ?? `${category.blurb} ${count} pieces in stock.`,
    path: `/collections/${category.slug}`,
    image: category.cover,
    keywords: seo?.keywords,
  });
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProductsByCategory(category.slug),
    getCategories(),
  ]);
  const seo = SEO_COPY[slug];

  return (
    <>
      <JsonLd
        data={[
          collectionSchema(category, products.length),
          itemListSchema(products, category.title),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: category.title, path: `/collections/${category.slug}` },
          ]),
        ]}
      />

      <div className="shell py-12 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-muted">
            <li><Link href="/" className="hover:text-patina">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/shop" className="hover:text-patina">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-birch">{category.label}</li>
          </ol>
        </nav>

        <header className="max-w-2xl">
          <p className="stamp">{products.length} pieces</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            {seo?.title ?? category.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{category.blurb}</p>
        </header>

        <div className="mt-10">
          <Suspense fallback={<p className="stamp">Loading…</p>}>
            <ShopBrowser products={products} lockedCategory={category.slug} />
          </Suspense>
        </div>

        <nav aria-label="Other collections" className="mt-20">
          <h2 className="stamp">Other rooms</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {categories.filter((c) => c.slug !== category.slug).map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="chip hover:border-patina hover:text-patina">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
