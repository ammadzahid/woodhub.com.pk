import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import {
  getCategories,
  getProducts,
  getFeatured,
  getBestSellers,
  getOnSale,
} from '@/lib/data/products';
import { SHIPPING, SITE } from '@/lib/site';
import { pkr } from '@/lib/format';
import { buildMeta, itemListSchema } from '@/lib/seo';

import ProductGrid from '@/components/ProductGrid';
import Reveal from '@/components/Reveal';
import EndGrain, { GrainRule } from '@/components/EndGrain';
import JsonLd from '@/components/JsonLd';
import Rating from '@/components/Rating';

export const metadata: Metadata = buildMeta({
  title: 'WoodHub — Handmade Wooden Home Decor in Pakistan',
  description:
    'Solid sheesham, walnut and acacia wall art, shelves, serving boards, desk organisers, lamps and engraved gifts. Made in Lahore, delivered across Pakistan. Cash on delivery, JazzCash, Easypaisa and bank transfer.',
  path: '/',
  keywords: [
    'wooden home decor Pakistan',
    'handmade wooden wall art Lahore',
    'sheesham floating shelf price in Pakistan',
    'wooden serving tray online Pakistan',
    'engraved wooden gifts Pakistan',
  ],
});

export const revalidate = 300;

const HERO_SLUG = 'carved-mandala-wall-art';

const PROMISES = [
  { k: '', v: 'pieces in the catalogue' },
  { k: '4', v: 'woods, no particle board' },
  { k: '3–5', v: 'days, anywhere in Pakistan' },
  { k: '7', v: 'day returns, no questions' },
];

const REVIEWS = [
  {
    name: 'Hira S.',
    city: 'Karachi',
    rating: 5,
    body: 'Ordered the mandala for our drawing room and honestly the photos undersell it. The carving is deep, not printed on. Arrived in four days with COD.',
    product: 'Carved Mandala Wall Art',
  },
  {
    name: 'Bilal A.',
    city: 'Lahore',
    rating: 5,
    body: 'The chopping board has taken six months of daily use and still looks new after re-oiling. Worth every rupee compared to the cheap ones that warped.',
    product: 'Walnut Chopping Board',
  },
  {
    name: 'Ayesha K.',
    city: 'Islamabad',
    rating: 4.5,
    body: 'Hexagon shelves came with a paper template which saved me from drilling five wrong holes. Small thing, made the whole install painless.',
    product: 'Honeycomb Hexagon Shelf',
  },
];

export default async function HomePage() {
  const [products, categories, featured, sellers, sale] = await Promise.all([
    getProducts(),
    getCategories(),
    getFeatured(8),
    getBestSellers(4),
    getOnSale(4),
  ]);

  const HERO = products.find((p) => p.slug === HERO_SLUG) ?? featured[0] ?? products[0];
  if (!HERO) return null;

  return (
    <>
      <JsonLd data={itemListSchema(featured, 'Featured WoodHub pieces')} />

      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="shell grid items-center gap-10 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <p className="stamp animate-fade">
              {products.length} pieces · cut and finished in {SITE.city}
            </p>

            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.2rem]">
              Every ring is a year.
              <span className="block text-patina">We try not to sand them out.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Wall art, shelves, boards and lamps carved from solid sheesham, walnut and acacia —
              then oiled, never laminated. Made here, delivered anywhere in Pakistan.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn-primary">
                Shop all {products.length} pieces
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h13M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/guides/how-to-choose-wood" className="btn-ghost">
                Which wood should I buy?
              </Link>
            </div>

            <dl className="mt-11 grid max-w-lg grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {PROMISES.map((p) => (
                <div key={p.v}>
                  <dt className="font-display text-2xl text-patina">{p.k || products.length}</dt>
                  <dd className="mt-1 font-mono text-2xs uppercase leading-relaxed tracking-stamp text-muted">
                    {p.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* signature: the end-grain cross-section, drawn on load, behind the hero piece */}
          <div className="relative">
            <EndGrain className="absolute inset-0 -m-12 h-[calc(100%+6rem)] w-[calc(100%+6rem)] text-patina" />
            <Reveal className="relative">
              <Link
                href={`/product/${HERO.slug}`}
                className="group relative block overflow-hidden rounded-[2.5rem] border border-edge bg-raise shadow-lift"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={HERO.image}
                    alt={`${HERO.name} — hand-carved ${HERO.wood.toLowerCase()} wall art by WoodHub`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <p className="stamp">
                    {HERO.wood} · {HERO.dimensions} · {HERO.finish}
                  </p>
                  <h2 className="mt-2 font-display text-2xl sm:text-[1.65rem]">{HERO.name}</h2>
                  <p className="mt-2 flex items-baseline gap-3">
                    <span className="font-display text-xl text-patina">{pkr(HERO.price)}</span>
                    {HERO.compareAt && (
                      <span className="font-mono text-2xs text-muted line-through">{pkr(HERO.compareAt)}</span>
                    )}
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>

        {/* running promise strip */}
        <div className="border-y border-edge bg-bark/40 py-3.5">
          <div className="flex overflow-hidden">
            <ul className="flex shrink-0 animate-marquee items-center gap-10 pr-10 font-mono text-2xs uppercase tracking-stamp text-muted">
              {[...STRIP, ...STRIP].map((s, i) => (
                <li key={i} className="flex shrink-0 items-center gap-2.5">
                  <span className="h-1 w-1 rounded-full bg-patina" />
                  {s}
                </li>
              ))}
            </ul>
            <ul aria-hidden="true" className="flex shrink-0 animate-marquee items-center gap-10 pr-10 font-mono text-2xs uppercase tracking-stamp text-muted">
              {[...STRIP, ...STRIP].map((s, i) => (
                <li key={i} className="flex shrink-0 items-center gap-2.5">
                  <span className="h-1 w-1 rounded-full bg-patina" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- collections */}
      <section className="shell py-16 lg:py-24" aria-labelledby="collections-heading">
        <SectionHead
          eyebrow="Six rooms, six jobs"
          id="collections-heading"
          title="Start with where it will live"
          body="Everything is grouped by the room it ends up in rather than by wood type, because that is how people actually shop for it."
        />

        <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <Reveal as="li" key={c.slug} delay={i * 60}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="group relative block h-full overflow-hidden rounded-3xl border border-edge bg-raise"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={c.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                      className="object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl">{c.title}</h3>
                      <span className="stamp shrink-0">{count} pieces</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{c.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------------ featured */}
      <section className="shell py-6 lg:py-10" aria-labelledby="featured-heading">
        <SectionHead
          eyebrow="Off the bench this week"
          id="featured-heading"
          title="The pieces we keep re-making"
          body="These sell out first. Each one is cut to the same spec every time, so what you see is what arrives."
          action={{ href: '/shop', label: 'See everything' }}
        />
        <div className="mt-11">
          <ProductGrid products={featured} priorityCount={2} />
        </div>
      </section>

      {/* --------------------------------------------------------- craft story */}
      <section className="shell py-16 lg:py-24">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[300px] lg:min-h-[460px]">
                <Image
                  src="/products/live-edge-floating-shelf.jpg"
                  alt="Live edge acacia shelf showing the natural bark line along the front edge"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bark via-transparent to-transparent lg:bg-gradient-to-r" />
              </div>

              <div className="p-8 sm:p-11 lg:p-14">
                <p className="stamp">Why it costs more than the market</p>
                <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
                  Three things we refuse to skip
                </h2>

                <ol className="mt-8 space-y-7">
                  {CRAFT.map((c, i) => (
                    <li key={c.title} className="flex gap-5">
                      <span className="font-mono text-2xs text-patina">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="font-display text-lg">{c.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <Link href="/about" className="btn-ghost btn-sm mt-9">
                  Inside the workshop
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- bestsellers */}
      <section className="shell" aria-labelledby="best-heading">
        <SectionHead
          eyebrow="Most reviewed"
          id="best-heading"
          title="What Pakistan keeps ordering"
          action={{ href: '/shop?sort=popular', label: 'All best sellers' }}
        />
        <div className="mt-11">
          <ProductGrid products={sellers} />
        </div>
      </section>

      <GrainRule className="shell my-16 lg:my-24" />

      {/* ------------------------------------------------------------- reviews */}
      <section className="shell" aria-labelledby="reviews-heading">
        <SectionHead
          eyebrow="From the order notes"
          id="reviews-heading"
          title="What people say once it is on the wall"
        />
        <ul className="mt-11 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal as="li" key={r.name} delay={i * 80}>
              <figure className="card flex h-full flex-col p-7">
                <Rating value={r.rating} size="md" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-birch/90">
                  “{r.body}”
                </blockquote>
                <figcaption className="mt-6 border-t border-edge pt-4">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="mt-0.5 stamp">
                    {r.city} · {r.product}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- sale */}
      {sale.length > 0 && (
        <section className="shell py-16 lg:py-24" aria-labelledby="sale-heading">
          <SectionHead
            eyebrow="Reduced this month"
            id="sale-heading"
            title="Same wood, smaller number"
            action={{ href: '/shop?sale=1', label: 'All reductions' }}
          />
          <div className="mt-11">
            <ProductGrid products={sale} />
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- cta */}
      <section className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-edge bg-gradient-to-br from-patina-deep/30 via-bark to-bark p-9 sm:p-14">
            <EndGrain
              className="pointer-events-none absolute -right-20 -top-24 h-[26rem] w-[26rem] text-patina opacity-20"
              animate={false}
            />
            <div className="relative max-w-xl">
              <p className="stamp">No card needed</p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-[2.6rem]">
                Pay the rider, or pay by JazzCash. Either works.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                Cash on delivery, JazzCash, Easypaisa and bank transfer are all accepted. Free
                delivery over {pkr(SHIPPING.freeOver)}, and seven days to send anything back.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="btn-primary">
                  Start shopping
                </Link>
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

const STRIP = [
  'Solid wood only',
  'Cash on delivery',
  'JazzCash & Easypaisa',
  '7-day returns',
  'Made in Lahore',
  'Free delivery over Rs 7,500',
];

const CRAFT = [
  {
    title: 'One board, not four glued together',
    body: 'A carved panel cut from a single board cannot split along a glue line, because there is not one. It costs more in material and wastes more offcut. We do it anyway.',
  },
  {
    title: 'Sanded to 400 grit, then oiled',
    body: 'Most workshops stop at 150 grit and hide it under thick lacquer. We go to 400 and finish with oil or wax, so the surface feels like wood rather than plastic.',
  },
  {
    title: 'Fixings in the box',
    body: 'Every shelf and panel ships with the right anchors, screws and a paper drilling template. You should not need a second trip to the hardware shop.',
  },
];

function SectionHead({
  eyebrow,
  title,
  body,
  action,
  id,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  action?: { href: string; label: string };
  id?: string;
}) {
  return (
    <Reveal className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-xl">
        <p className="stamp">{eyebrow}</p>
        <h2 id={id} className="mt-3 font-display text-3xl leading-tight sm:text-[2.5rem]">
          {title}
        </h2>
        {body && <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{body}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-patina"
        >
          {action.label}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h13M12 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </Reveal>
  );
}
