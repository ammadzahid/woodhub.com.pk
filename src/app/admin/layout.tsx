import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | WoodHub Admin' },
  robots: { index: false, follow: false, nocache: true },
};

/** Shell sirf noindex ke liye — asli guard (panel)/layout.tsx me hai,
 *  taake /admin/login us guard ke bahar rahe aur redirect loop na bane. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
