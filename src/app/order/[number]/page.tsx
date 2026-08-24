import type { Metadata } from 'next';
import { buildMeta } from '@/lib/seo';
import OrderConfirmation from '@/components/OrderConfirmation';

export const metadata: Metadata = buildMeta({
  title: 'Order confirmed',
  description: 'Your WoodHub order has been placed.',
  path: '/order',
  noindex: true,
});

export default async function OrderPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return (
    <div className="shell py-14 lg:py-20">
      <OrderConfirmation number={decodeURIComponent(number)} />
    </div>
  );
}
