import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import { SITE } from '@/lib/site';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = buildMeta({
  title: 'Terms of Sale',
  description: 'The terms that apply when you order from WoodHub: pricing, stock, natural wood variation, payment verification, delivery and liability.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="The agreement, short version"
      title="Terms of sale"
      updated="1 July 2026"
      intro={`These terms apply to every order placed with ${SITE.legalName}. Placing an order means you accept them.`}
      blocks={[
        {
          h: 'Prices and currency',
          p: [
            'All prices are in Pakistani Rupees and include applicable taxes. Delivery and any cash handling fee are shown separately at checkout before you confirm.',
            'We can change prices at any time, but never after you have placed an order. What you saw at checkout is what you pay.',
          ],
        },
        {
          h: 'Stock',
          p: [
            'Stock counts on product pages are kept current, but two people can occasionally order the last piece at the same moment. If that happens we contact you within one working day and offer a wait, a swap or a full refund.',
          ],
        },
        {
          h: 'Natural variation',
          p: [
            'Every piece is cut from solid wood. Grain pattern, colour tone and knot placement vary between pieces, and photographs cannot capture that exactly.',
            'This variation is a property of the material, not a defect, and it is not grounds for a return. Where a piece is described as live edge or hand-carved, the variation is larger by design.',
          ],
        },
        {
          h: 'Payment verification',
          p: [
            'For JazzCash, Easypaisa and bank transfer orders, dispatch happens after we match your payment to the transaction ID you entered.',
            'If we cannot match a payment within three working days and you do not respond to our messages, the order is cancelled and any received funds are returned in full.',
          ],
        },
        {
          h: 'Cash on delivery',
          p: [
            'Cash orders carry a handling fee shown at checkout. If a parcel is refused at the door or nobody is reachable after two delivery attempts, we may decline future cash on delivery orders to the same address and ask for advance payment instead.',
          ],
        },
        {
          h: 'Personalised items',
          p: [
            'Engraving is cut exactly as you typed it at checkout, including spelling and punctuation. Please check it before confirming. We cannot remake an item because of a typo in what was submitted.',
          ],
        },
        {
          h: 'Delivery risk',
          p: [
            'Risk passes to you on delivery. Damage in transit is our responsibility if reported with photographs within 48 hours of the parcel arriving.',
          ],
        },
        {
          h: 'Liability',
          p: [
            'Our liability for any order is limited to the amount you paid for it. We are not liable for indirect losses, including damage caused by incorrect installation.',
            'Wall-mounted pieces must be fitted using appropriate anchors for your wall type. Fixings we supply suit solid brick and concrete; other wall types need anchors chosen for them.',
          ],
        },
        {
          h: 'Governing law',
          p: [`These terms are governed by the laws of Pakistan, and any dispute falls to the courts of ${SITE.city}.`],
        },
      ]}
    />
  );
}
