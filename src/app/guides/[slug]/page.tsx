import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { GUIDES, guideBySlug } from '@/lib/guides';
import { buildMeta, articleSchema, faqSchema, breadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import Accordion from '@/components/Accordion';
import { GrainRule } from '@/components/EndGrain';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return buildMeta({ title: 'Not found', description: '', path: '/guides', noindex: true });

  return buildMeta({
    title: guide.metaTitle,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    image: guide.cover,
    keywords: guide.keywords,
    type: 'article',
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const related = guide.related.map(guideBySlug).filter(Boolean);

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: guide.title,
            description: guide.description,
            path: `/guides/${guide.slug}`,
            published: guide.published,
            updated: guide.updated,
            image: guide.cover,
          }),
          faqSchema(guide.faq),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: guide.metaTitle, path: `/guides/${guide.slug}` },
          ]),
        ]}
      />

      <article className="shell py-10 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-muted">
            <li><Link href="/" className="hover:text-patina">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/guides" className="hover:text-patina">Guides</Link></li>
          </ol>
        </nav>

        <header className="mx-auto max-w-3xl">
          <p className="stamp">
            {guide.readMinutes} min read · Updated{' '}
            {new Date(guide.updated).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
          </p>
          <h1 className="mt-4 font-display text-3xl leading-[1.12] sm:text-5xl">{guide.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{guide.intro}</p>
        </header>

        <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-4xl border border-edge">
          <div className="relative aspect-[21/9]">
            <Image
              src={guide.cover}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 96vw, 60rem"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          </div>
        </div>

        {/* table of contents */}
        <nav aria-label="On this page" className="mx-auto mt-12 max-w-3xl">
          <h2 className="stamp">On this page</h2>
          <ol className="mt-4 space-y-2">
            {guide.sections.map((s, i) => (
              <li key={s.h} className="flex gap-3 text-sm">
                <span className="font-mono text-2xs text-patina">{String(i + 1).padStart(2, '0')}</span>
                <a href={`#s${i + 1}`} className="link-quiet">{s.h}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mx-auto mt-14 max-w-3xl">
          {guide.sections.map((s, i) => (
            <section key={s.h} id={`s${i + 1}`} className="scroll-mt-28 pb-11">
              <h2 className="font-display text-2xl leading-snug sm:text-3xl">{s.h}</h2>
              {s.p.map((para) => (
                <p key={para.slice(0, 24)} className="mt-4 text-base leading-relaxed text-birch/85">
                  {para}
                </p>
              ))}
              {s.list && (
                <ul className="mt-6 space-y-3 rounded-2xl border border-edge bg-bark p-6">
                  {s.list.map((li) => (
                    <li key={li} className="flex gap-3 text-sm leading-relaxed text-birch/90">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-patina" />
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <GrainRule className="mx-auto my-6 max-w-3xl" />

        <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="guide-faq">
          <h2 id="guide-faq" className="font-display text-2xl sm:text-3xl">Common questions</h2>
          <div className="mt-7">
            <Accordion items={guide.faq} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="guide-related">
            <h2 id="guide-related" className="stamp">Read next</h2>
            <ul className="mt-4 space-y-2.5">
              {related.map((r) => (
                <li key={r!.slug}>
                  <Link
                    href={`/guides/${r!.slug}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-edge bg-bark px-5 py-4 transition-colors hover:border-patina"
                  >
                    <span className="text-sm">{r!.title}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57C3A7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M5 12h13M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mx-auto mt-16 max-w-3xl rounded-4xl border border-edge bg-gradient-to-br from-patina-deep/25 to-bark p-9 text-center">
          <h2 className="font-display text-2xl sm:text-3xl">Now go and pick something</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Every piece lists its wood, dimensions and finish before you add it to the cart.
          </p>
          <Link href="/shop" className="btn-primary mt-7">Browse the shop</Link>
        </div>
      </article>
    </>
  );
}
