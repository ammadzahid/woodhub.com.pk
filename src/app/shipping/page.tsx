import type { Metadata } from 'next';
import { buildMeta, faqSchema } from '@/lib/seo';
import { SHIPPING, SITE } from '@/lib/site';
import { pkr } from '@/lib/format';
import PolicyPage from '@/components/PolicyPage';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildMeta({
  title: 'Delivery & Returns',
  description: `Flat ${pkr(SHIPPING.flatRate)} delivery across Pakistan, free over ${pkr(SHIPPING.freeOver)}. Two to five working days, seven-day returns, damage replaced in full.`,
  path: '/shipping',
  keywords: ['delivery charges Pakistan online furniture', 'return policy wooden decor', 'cash on delivery charges'],
});

export default function ShippingPage() {
  return (
    <>
      <JsonLd
        data={faqSchema([
          { q: 'How much does delivery cost?', a: `Flat ${pkr(SHIPPING.flatRate)} anywhere in Pakistan, and free once your order total passes ${pkr(SHIPPING.freeOver)}.` },
          { q: 'How long does delivery take?', a: `${SHIPPING.etaCity} inside ${SITE.city} and ${SHIPPING.etaCountry} elsewhere in Pakistan.` },
          { q: 'Can I return a wooden product?', a: 'Yes, within seven days of delivery if it is unused and in its original packaging. Engraved and personalised items are excluded unless they arrive damaged.' },
        ])}
      />
      <PolicyPage
        eyebrow="No surprises at the door"
        title="Delivery & returns"
        updated="1 July 2026"
        intro="Everything about how your order reaches you, what it costs, and what happens if something goes wrong."
        blocks={[
          {
            h: 'What delivery costs',
            p: [`We charge a flat ${pkr(SHIPPING.flatRate)} anywhere in Pakistan. Once your order total passes ${pkr(SHIPPING.freeOver)}, delivery is free and applied automatically at checkout.`],
            list: [
              `Flat rate nationwide: ${pkr(SHIPPING.flatRate)}`,
              `Free delivery threshold: ${pkr(SHIPPING.freeOver)}`,
              `Cash on delivery handling fee: ${pkr(SHIPPING.codFee)}`,
            ],
          },
          {
            h: 'How long it takes',
            p: [
              `Orders placed before 4pm on a working day are usually dispatched the same day. After that, the next working day.`,
              `Once dispatched, expect ${SHIPPING.etaCity} inside ${SITE.city} and ${SHIPPING.etaCountry} for the rest of Pakistan. Remote areas can add a day.`,
              'Engraved and personalised pieces are engraved before dispatch and do not add time, but custom-size orders take seven to ten working days.',
            ],
          },
          {
            h: 'Tracking your parcel',
            p: [
              'You get a WhatsApp message with the courier and tracking number as soon as the parcel leaves the workshop. If you have not received it within two working days of ordering, message us with your order number.',
            ],
          },
          {
            h: 'Payment before dispatch',
            p: [
              'Cash on delivery orders are confirmed immediately. JazzCash, Easypaisa and bank transfer orders are dispatched once we have matched your payment to the transaction ID you entered — normally within a couple of working hours.',
              'If a transaction ID does not match anything on our side, we message you before doing anything else. We never cancel silently.',
            ],
          },
          {
            h: 'Returns within seven days',
            p: [
              'You have seven days from delivery to return a piece that is unused and still in its original packaging. Message us first so we can arrange the pickup.',
              'Return delivery is on you unless the item arrived damaged, faulty, or was not what you ordered — in those cases we cover it entirely.',
            ],
            list: [
              'Unused and in original packaging',
              'Within seven days of delivery',
              'Message us before sending anything back',
            ],
          },
          {
            h: 'What cannot be returned',
            p: [
              'Engraved and personalised items cannot be returned or exchanged, because they cannot be resold. The exception is if they arrive damaged, or the engraving does not match what you entered at checkout — then we replace them free.',
              'Natural variation in grain, tone or knot placement is not a fault and is not grounds for return. Every product page says this before you buy.',
            ],
          },
          {
            h: 'If it arrives damaged',
            p: [
              'Send photos on WhatsApp within 48 hours of delivery, including the outer box. We replace the piece or refund you in full, and we cover the return cost. No arguing, no forms.',
            ],
          },
          {
            h: 'Refund timing',
            p: [
              'Approved refunds go back the way you paid. JazzCash and Easypaisa refunds usually land within two working days, bank transfers within three to five. Cash on delivery refunds are sent to a JazzCash, Easypaisa or bank account you nominate.',
            ],
          },
        ]}
      />
    </>
  );
}
