import type { Metadata } from 'next';
import AdminSetup from '@/components/admin/AdminSetup';

export const metadata: Metadata = { title: 'Setup', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function AdminSetupPage() {
  return <AdminSetup reason="no-admin" />;
}
