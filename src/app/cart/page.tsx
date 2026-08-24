import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import CartView from '@/components/CartView';

export const metadata: Metadata = buildMeta({
  title: 'Your Cart',
  description: 'Review the pieces in your WoodHub cart before checkout.',
  path: '/cart',
  noindex: true,
});

export default function CartPage() {
  return (
    <div className="shell py-12 lg:py-16">
      <header className="mb-10">
        <p className="stamp">Almost there</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Your cart</h1>
      </header>
      <CartView />
    </div>
  );
}
