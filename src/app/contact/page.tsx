import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMeta, breadcrumbSchema } from '@/lib/seo';
import { SITE } from '@/lib/site';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildMeta({
  title: 'Contact WoodHub',
  description:
    'WhatsApp, phone and email for orders, custom sizes and delivery questions. Based in Lahore, delivering across Pakistan.',
  path: '/contact',
  keywords: ['WoodHub contact', 'custom wooden furniture Lahore contact'],
});

export default function ContactPage() {
  const rows = [
    {
      label: 'WhatsApp',
      value: SITE.phone,
      href: `https://wa.me/${SITE.whatsapp}`,
      note: 'Fastest. Usually answered within an hour on working days.',
    },
    {
      label: 'Phone',
      value: SITE.phone,
      href: `tel:${SITE.phone.replace(/\s/g, '')}`,
      note: 'Monday to Saturday, 10am to 7pm.',
    },
    {
      label: 'Email',
      value: SITE.email,
      href: `mailto:${SITE.email}`,
      note: 'For order records, invoices and anything you need in writing.',
    },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])} />

      <div className="shell py-12 lg:py-16">
        <header className="max-w-2xl">
          <p className="stamp">Real people, not a ticket queue</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Talk to us</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Custom sizes, bulk orders for offices and hotels, or a question about which wood suits
            your room — send a message and you will get a straight answer.
          </p>
        </header>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {rows.map((r) => (
            <li key={r.label}>
              <a
                href={r.href}
                target={r.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-3xl border border-edge bg-bark p-7 transition-colors hover:border-patina"
              >
                <span className="stamp">{r.label}</span>
                <span className="mt-3 font-display text-xl text-patina">{r.value}</span>
                <span className="mt-3 text-sm leading-relaxed text-muted">{r.note}</span>
              </a>
            </li>
          ))}
        </ul>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="card p-7">
            <h2 className="font-display text-xl">Where we are</h2>
            <address className="mt-4 not-italic text-sm leading-relaxed text-muted">
              {SITE.legalName}
              <br />
              {SITE.street}
              <br />
              {SITE.city} {SITE.postalCode}, Pakistan
            </address>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              The workshop is not a retail showroom, so please message before visiting and we will
              arrange a time.
            </p>
          </div>

          <div className="card p-7">
            <h2 className="font-display text-xl">Before you message</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Delivery times, payment methods and the returns window are all answered on the
              questions page — that covers most of what people ask.
            </p>
            <Link href="/faq" className="btn-ghost btn-sm mt-6">Read the questions</Link>
          </div>
        </section>
      </div>
    </>
  );
}
