import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMeta, breadcrumbSchema } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { getProducts } from '@/lib/data/products';
import JsonLd from '@/components/JsonLd';
import Reveal from '@/components/Reveal';
import EndGrain from '@/components/EndGrain';

export const metadata: Metadata = buildMeta({
  title: 'Inside the Workshop',
  description:
    'WoodHub is a small workshop in Lahore cutting solid sheesham, walnut, acacia and mango wood into wall art, shelves, boards and lamps. No MDF, no veneer, no printed grain.',
  path: '/about',
  keywords: ['handmade wooden furniture Lahore', 'solid wood workshop Pakistan', 'WoodHub about'],
});

const STAGES = [
  { t: 'Selecting the board', b: 'We buy seasoned stock, not green timber, and reject anything with a live knot where a screw has to go. Roughly a fifth of what we look at goes back.' },
  { t: 'Cutting and joining', b: 'Panels are cut from a single board wherever the design allows. Where a join is unavoidable, it is a real joint — not a butt edge held together with glue and hope.' },
  { t: 'Sanding to 400 grit', b: 'Most workshops stop at 150 and bury it under thick lacquer. We keep going to 400, which is why our pieces feel like wood rather than plastic.' },
  { t: 'Oil, wax or matte lacquer', b: 'Chosen per piece, not per batch. Anything you touch daily gets oil so it can be repaired at home. Wall pieces get matte lacquer so they only need dusting.' },
  { t: 'Fixings and packing', b: 'Anchors, screws and a drilling template go in the box, then the piece is corner-protected and double-boxed. Damage in transit is rare and always replaced.' },
];

export const revalidate = 3600;

export default async function AboutPage() {
  const products = await getProducts();

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />

      <div className="shell py-12 lg:py-16">
        <header className="relative max-w-3xl">
          <EndGrain className="pointer-events-none absolute -right-32 -top-32 h-[26rem] w-[26rem] text-patina opacity-[0.13]" animate={false} />
          <p className="stamp">A small bench in {SITE.city}</p>
          <h1 className="relative mt-4 font-display text-4xl leading-[1.1] sm:text-6xl">
            We would rather waste wood than hide a shortcut
          </h1>
          <p className="relative mt-6 text-lg leading-relaxed text-muted">
            WoodHub started because everything affordable in the market was MDF with a photograph of
            wood printed on it, and everything solid was priced like an heirloom. There was nothing
            in between. So we built the in-between.
          </p>
        </header>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            { k: products.length.toString(), v: 'pieces in the catalogue' },
            { k: '4', v: 'hardwoods, no board material' },
            { k: '400', v: 'grit before any finish goes on' },
          ].map((s) => (
            <div key={s.v} className="card p-7">
              <p className="font-display text-4xl text-patina">{s.k}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.v}</p>
            </div>
          ))}
        </div>

        <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16" aria-labelledby="process">
          <div className="relative overflow-hidden rounded-4xl border border-edge lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5]">
              <Image
                src="/products/jali-cutwork-wall-panel.jpg"
                alt="Hand-cut jali lattice panel in solid sheesham"
                fill
                sizes="(max-width: 1024px) 92vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <p className="stamp">Five stages, none of them skipped</p>
            <h2 id="process" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              How a board becomes a piece
            </h2>

            <ol className="mt-10 space-y-9">
              {STAGES.map((s, i) => (
                <Reveal as="li" key={s.t} delay={i * 60} className="flex gap-5">
                  <span className="font-mono text-2xs text-patina">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-display text-lg">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.b}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-24 rounded-4xl border border-edge bg-bark p-9 sm:p-14">
          <div className="max-w-2xl">
            <p className="stamp">The honest part</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              What we are not
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
              <p>
                We are not the cheapest. A sheesham panel cut from one board costs more in material
                than four strips glued together, and we are not going to pretend otherwise.
              </p>
              <p>
                We are not a factory. Batches are small, and occasionally something sells out for a
                week while we cut more. When that happens the product page says so rather than
                taking your money and going quiet.
              </p>
              <p>
                And we do not claim every piece is identical. Real wood varies. If two shelves from
                the same order have slightly different tone, that is the tree, not a mistake.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">See what we make</Link>
              <Link href="/guides" className="btn-ghost">Read the guides</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
