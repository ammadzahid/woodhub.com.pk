import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentAdmin, adminConfigured } from '@/lib/admin';
import { dbReady } from '@/lib/supabase';
import AdminNav from '@/components/admin/AdminNav';
import AdminSetup from '@/components/admin/AdminSetup';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!adminConfigured()) return <AdminSetup reason="no-admin" />;

  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div className="min-h-screen">
      <AdminNav email={admin.email} />

      <div className="shell py-8 lg:py-10">
        {!dbReady && (
          <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4">
            <p className="text-sm text-birch">
              <strong className="font-semibold">Database not connected.</strong> The storefront is
              running on the seed catalogue, and orders are not being stored. Set{' '}
              <code className="font-mono text-2xs text-patina">SUPABASE_URL</code> and{' '}
              <code className="font-mono text-2xs text-patina">SUPABASE_SERVICE_ROLE_KEY</code>, then
              run the schema in <code className="font-mono text-2xs text-patina">supabase-schema.sql</code>.
            </p>
            <Link href="/admin/setup" className="mt-3 inline-block text-sm text-patina underline underline-offset-4">
              Setup steps
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
