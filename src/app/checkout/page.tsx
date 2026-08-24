import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import CheckoutForm from '@/components/CheckoutForm';

export const metadata: Metadata = buildMeta({
  title: 'Checkout',
  description:
    'Complete your WoodHub order with cash on delivery, JazzCash, Easypaisa or bank transfer.',
  path: '/checkout',
  noindex: true,
});

export default function CheckoutPage() {
  return (
    <div className="shell py-12 lg:py-16">
      <header className="mb-10">
        <p className="stamp">Three steps, no account required</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Checkout</h1>
      </header>
      <CheckoutForm />
    </div>
  );
}
