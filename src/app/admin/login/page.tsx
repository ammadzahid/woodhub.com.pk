import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin, adminConfigured, adminEmails, adminPassword } from '@/lib/admin';
import AdminSetup from '@/components/admin/AdminSetup';
import AdminLogin from '@/components/admin/AdminLogin';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (!adminConfigured()) return <AdminSetup reason="no-admin" />;
  if (await currentAdmin()) redirect('/admin');

  return (
    <AdminLogin
      googleEnabled={adminEmails().length > 0 && Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
      passwordEnabled={adminPassword().length > 0}
    />
  );
}
