import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { buildMeta } from '@/lib/seo';
import { SESSION_COOKIE, openSession } from '@/lib/session';
import { getOrdersForAccount } from '@/lib/data/orders';
import AccountView from '@/components/AccountView';
import OrderHistory from '@/components/OrderHistory';

export const metadata: Metadata = buildMeta({
  title: 'Your account',
  description: 'Sign in with Google to keep your delivery details ready for next time.',
  path: '/account',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const jar = await cookies();
  const session = openSession(jar.get(SESSION_COOKIE)?.value);
  const orders = session ? await getOrdersForAccount(session.sub, session.email) : [];

  return (
    <div className="shell py-12 lg:py-16">
      <header className="mb-10">
        <p className="stamp">Your details, saved once</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Account</h1>
      </header>

      <AccountView />

      <div className="mt-14">
        <OrderHistory orders={orders} signedIn={Boolean(session)} />
      </div>
    </div>
  );
}
