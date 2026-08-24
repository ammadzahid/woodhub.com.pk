import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import { SITE } from '@/lib/site';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = buildMeta({
  title: 'Privacy Notice',
  description: 'What WoodHub collects when you order or sign in with Google, why we collect it, how long we keep it, and how to have it deleted.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Plain language, no legal fog"
      title="Privacy notice"
      updated="1 July 2026"
      intro="We collect what an order needs and nothing beyond that. Here is exactly what that means."
      blocks={[
        {
          h: 'What we collect',
          p: ['Only what is needed to get a parcel to your door and to answer you afterwards.'],
          list: [
            'Name, email, mobile number and delivery address',
            'What you ordered and what you paid',
            'The transaction ID you enter for JazzCash, Easypaisa or bank transfer',
            'Basic anonymous usage data, such as which pages get visited',
          ],
        },
        {
          h: 'Signing in with Google',
          p: [
            'If you choose to sign in with Google, we receive your name, email address and profile picture from Google. That is all. We never receive your password, and we cannot see anything else in your Google account.',
            'The sign-in is stored as a signed cookie on your device. Signing out clears it immediately.',
          ],
        },
        {
          h: 'What stays on your device',
          p: [
            'Your cart and your saved delivery details are stored in your browser, not on our servers. Clearing your browser data clears both. We cannot read them and we cannot recover them for you.',
          ],
        },
        {
          h: 'Why we collect it',
          p: ['Three reasons only: fulfilling your order, verifying a payment you told us about, and answering you when you contact us. We do not build advertising profiles and we do not sell data.'],
        },
        {
          h: 'Who else sees it',
          p: [
            'The courier gets your name, address and phone number, because otherwise they cannot deliver. Payment processors see the transaction reference you give us.',
            'That is the complete list. We do not share your details with anyone else, for any reason, unless a Pakistani court orders us to.',
          ],
        },
        {
          h: 'How long we keep it',
          p: [
            'Order records are kept for three years for accounting and warranty purposes. Marketing contacts are kept until you unsubscribe. Anything else is deleted when it stops being useful.',
          ],
        },
        {
          h: 'Your choices',
          p: [`Email ${SITE.email} and we will send you a copy of everything we hold about you, correct anything wrong, or delete it entirely. We reply within seven working days.`],
        },
        {
          h: 'Cookies',
          p: [
            'We use a signed session cookie if you sign in, and your browser storage for the cart. Any analytics we run is aggregated and does not identify you personally.',
          ],
        },
      ]}
    />
  );
}
