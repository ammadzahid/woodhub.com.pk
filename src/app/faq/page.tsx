import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMeta, faqSchema, breadcrumbSchema } from '@/lib/seo';
import { SITE, SHIPPING } from '@/lib/site';
import { pkr } from '@/lib/format';
import Accordion from '@/components/Accordion';
import JsonLd from '@/components/JsonLd';

const FAQ = [
  {
    q: 'Do you offer cash on delivery?',
    a: 'Yes, anywhere in Pakistan. The rider collects the amount in cash when the parcel reaches you. A Rs 100 handling fee applies to cash orders. Please keep the exact amount ready, as riders often cannot break large notes.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Cash on delivery, JazzCash, Easypaisa and direct bank transfer. For the three transfer methods you send the payment first, then enter the transaction ID at checkout. We verify it and dispatch, usually within a couple of working hours.',
  },
  {
    q: 'How long does delivery take?',
    a: `Two to three working days inside ${SITE.city}, and three to five working days everywhere else in Pakistan. Orders placed before 4pm are usually dispatched the same working day.`,
  },
  {
    q: 'How much is delivery?',
    a: `Flat ${pkr(SHIPPING.flatRate)} nationwide, and free once your order passes ${pkr(SHIPPING.freeOver)}.`,
  },
  {
    q: 'Can I return something?',
    a: 'Yes, within seven days of delivery, as long as the piece is unused and in its original packaging. Personalised and engraved items cannot be returned unless they arrive damaged or the engraving is wrong.',
  },
  {
    q: 'What if my order arrives damaged?',
    a: 'Send us photos on WhatsApp within 48 hours of delivery and we will replace it or refund you in full. We cover the return cost in that case.',
  },
  {
    q: 'Is the wood solid or veneer?',
    a: 'Solid, every time. We do not use MDF, particle board or veneered panels anywhere in the catalogue. Each product page lists the exact species — sheesham, walnut, acacia or mango wood.',
  },
  {
    q: 'Do shelves come with screws and wall plugs?',
    a: 'Yes. Every shelf and wall piece ships with the correct anchors and screws, and multi-piece sets include a full-size paper drilling template so your first hole is in the right place.',
  },
  {
    q: 'Will the colour match the photos exactly?',
    a: 'Close, but not identical. Every piece is cut from real wood, so grain and tone vary between pieces. That variation is the point — it is how you know it is not printed laminate.',
  },
  {
    q: 'Can I get something made to a custom size?',
    a: 'Often, yes. Message us on WhatsApp with the dimensions and the wood you want and we will quote you. Custom pieces usually take seven to ten working days.',
  },
  {
    q: 'Do I need an account to order?',
    a: 'No. Guest checkout works fully. Signing in with Google just saves your name, email and last delivery address so you do not have to type them again.',
  },
  {
    q: 'Do you deliver outside Pakistan?',
    a: 'Not yet. We ship nationwide within Pakistan only. International delivery is something we are working on.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Questions About Ordering, Delivery & Payment',
  description:
    'Cash on delivery, JazzCash and Easypaisa payments, delivery times across Pakistan, returns, custom sizes and wood quality — answered plainly.',
  path: '/faq',
  keywords: ['WoodHub delivery time', 'cash on delivery furniture Pakistan', 'wooden decor returns policy'],
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqSchema(FAQ),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Questions', path: '/faq' },
          ]),
        ]}
      />
      <div className="shell py-12 lg:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <p className="stamp">Before you ask us on WhatsApp</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Questions</h1>
        </header>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion items={FAQ} />
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-4xl border border-edge bg-bark p-9 text-center">
          <h2 className="font-display text-2xl">Still stuck?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            We answer WhatsApp faster than email, usually within an hour during working days.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
              WhatsApp us
            </a>
            <Link href="/contact" className="btn-ghost">Other ways to reach us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
