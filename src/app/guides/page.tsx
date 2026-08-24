import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { GUIDES } from '@/lib/guides';
import { buildMeta, breadcrumbSchema } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = buildMeta({
  title: 'Wood Care & Buying Guides',
  description:
    'Practical guides on choosing between sheesham, walnut, acacia and mango wood, hanging shelves on brick and concrete walls, and keeping wooden boards alive for years.',
  path: '/guides',
  keywords: ['wood care guide Pakistan', 'how to hang a wooden shelf', 'which wood to buy', 'chopping board oil guide'],
});

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
        ])}
      />
      <div className="shell py-12 lg:py-16">
        <header className="max-w-2xl">
          <p className="stamp">Written by the people who cut it</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Guides worth reading before you buy
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            No fluff and no upselling — the same answers we give on WhatsApp twenty times a week,
            written down properly.
          </p>
        </header>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Reveal as="li" key={g.slug} delay={i * 70}>
              <Link href={`/guides/${g.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-edge bg-bark">
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={g.cover}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 92vw, 32vw"
                    className="object-cover opacity-75 transition-all duration-700 group-hover:scale-105 group-hover:opacity-95"
                  />
                </span>
                <span className="flex flex-1 flex-col p-6">
                  <span className="stamp">{g.readMinutes} min read</span>
                  <h2 className="mt-3 font-display text-xl leading-snug group-hover:text-patina">
                    {g.title}
                  </h2>
                  <span className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                    {g.description}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </>
  );
}
