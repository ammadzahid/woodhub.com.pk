import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { discountPercent } from '@/lib/catalog';
import { getProducts, getProduct, getRelated, getCategory } from '@/lib/data/products';
import { pkr } from '@/lib/format';
import { SHIPPING, SITE } from '@/lib/site';
import { buildMeta, productSchema, breadcrumbSchema } from '@/lib/seo';

import AddToCart from '@/components/AddToCart';
import ProductGrid from '@/components/ProductGrid';
import Rating from '@/components/Rating';
import JsonLd from '@/components/JsonLd';
import Reveal from '@/components/Reveal';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return buildMeta({ title: 'Not found', description: '', path: '/shop', noindex: true });

  const cat = await getCategory(product.category);
  return buildMeta({
    title: `${product.name} — ${product.wood}, ${product.dimensions}`,
    description: `${product.description} ${pkr(product.price)} with delivery across Pakistan. Cash on delivery, JazzCash, Easypaisa and bank transfer accepted.`,
    path: `/product/${product.slug}`,
    image: product.image,
    keywords: [
      product.name.toLowerCase(),
      `${product.name.toLowerCase()} price in Pakistan`,
      `${product.wood.toLowerCase()} ${cat?.label.toLowerCase() ?? ''}`.trim(),
      'buy online Pakistan cash on delivery',
    ],
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [cat, related] = await Promise.all([
    getCategory(product.category),
    getRelated(product, 4),
  ]);
  if (!cat) notFound();
  const off = discountPercent(product);
  const freeShipping = product.price >= SHIPPING.freeOver;

  return (
    <>
      <JsonLd
        data={[
          productSchema(product),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: cat.title, path: `/collections/${cat.slug}` },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
        ]}
      />

      <div className="shell py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-muted">
            <li><Link href="/" className="hover:text-patina">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/shop" className="hover:text-patina">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/collections/${cat.slug}`} className="hover:text-patina">{cat.label}</Link></li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* ---- image ---- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[2rem] border border-edge bg-raise">
              <div className="relative aspect-[4/5]">
                <Image
                  src={product.image}
                  alt={`${product.name}, ${product.dimensions} in ${product.wood.toLowerCase()} with a ${product.finish.toLowerCase()} finish`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 94vw, 46vw"
                  className="object-cover"
                />
              </div>
              {off > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-patina px-3 py-1.5 font-mono text-2xs font-bold uppercase tracking-stamp text-ink">
                  {off}% off
                </span>
              )}
            </div>

            <p className="mt-4 stamp text-center">
              Photographed in daylight. Grain varies piece to piece.
            </p>
          </div>

          {/* ---- buy panel ---- */}
          <div>
            <p className="stamp">{cat.title}</p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-[2.6rem]">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Rating value={product.rating} reviews={product.reviews} size="md" />
              <span className="stamp">SKU {product.sku}</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl text-patina">{pkr(product.price)}</span>
              {product.compareAt && (
                <span className="font-mono text-sm text-muted line-through">{pkr(product.compareAt)}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">
              {freeShipping
                ? 'Free delivery on this piece.'
                : `Delivery ${pkr(SHIPPING.flatRate)}, free once your basket passes ${pkr(SHIPPING.freeOver)}.`}
            </p>

            <p className="mt-6 text-base leading-relaxed text-birch/90">{product.description}</p>

            <AddToCart product={product} />

            {/* ---- spec table: the maker's stamp, expanded ---- */}
            <section className="mt-10" aria-labelledby="spec-heading">
              <h2 id="spec-heading" className="stamp">Specification</h2>
              <dl className="mt-4 divide-y divide-edge border-y border-edge">
                {[
                  ['Wood', product.wood],
                  ['Dimensions', product.dimensions],
                  ['Finish', product.finish],
                  ['In stock', `${product.stock} ready to send`],
                  ['Dispatch', 'Same or next working day'],
                  ['Delivery', `${SHIPPING.etaCity} in ${SITE.city}, ${SHIPPING.etaCountry} elsewhere`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3.5">
                    <dt className="stamp shrink-0">{k}</dt>
                    <dd className="text-right text-sm text-birch/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-10" aria-labelledby="detail-heading">
              <h2 id="detail-heading" className="stamp">What you should know</h2>
              <ul className="mt-4 space-y-3">
                {product.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-relaxed text-birch/90">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#57C3A7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-2xl border border-edge bg-bark p-5 text-sm leading-relaxed text-muted">
                <span className="stamp mb-1.5 block">About {product.wood.toLowerCase()}</span>
                {product.woodNote}
              </p>
            </section>

            <section className="mt-10" aria-labelledby="pay-heading">
              <h2 id="pay-heading" className="stamp">How you can pay</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2.5">
                {['Cash on delivery', 'JazzCash', 'Easypaisa', 'Bank transfer'].map((m) => (
                  <li key={m} className="rounded-2xl border border-edge bg-bark px-4 py-3 text-sm text-birch/90">
                    {m}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Seven days to return anything that arrives damaged or is not what you expected.{' '}
                <Link href="/shipping" className="text-patina underline underline-offset-4">
                  Delivery and returns
                </Link>
              </p>
            </section>
          </div>
        </div>

        {/* ---- related ---- */}
        <section className="mt-24" aria-labelledby="related-heading">
          <Reveal>
            <p className="stamp">Cut from the same run</p>
            <h2 id="related-heading" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              People also took these home
            </h2>
          </Reveal>
          <div className="mt-10">
            <ProductGrid products={related} />
          </div>
        </section>
      </div>
    </>
  );
}
