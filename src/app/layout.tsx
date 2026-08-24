import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/manrope';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';

import { CartProvider } from '@/lib/cart';
import { AuthProvider } from '@/lib/auth';
import { SITE } from '@/lib/site';
import { organizationSchema, websiteSchema } from '@/lib/seo';
import { getCategories } from '@/lib/data/products';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomBar from '@/components/BottomBar';
import LoginPrompt from '@/components/LoginPrompt';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'WoodHub — Handmade Wooden Home Decor in Pakistan',
    template: '%s | WoodHub',
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName, url: SITE.url }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  category: 'Home & Garden',
  keywords: [
    'wooden home decor Pakistan',
    'handmade wooden wall art',
    'sheesham wall shelf',
    'wooden serving tray Pakistan',
    'walnut chopping board',
    'wooden desk organiser',
    'engraved wooden gifts Pakistan',
    'cash on delivery furniture Pakistan',
    'WoodHub',
  ],
  alternates: { canonical: SITE.url },
  formatDetection: { telephone: true, address: false, email: true },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: 'WoodHub — Handmade Wooden Home Decor in Pakistan',
    description: SITE.description,
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0F1A15',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="en-PK" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://accounts.google.com" />
        <style
          // font-family CSS vars, wired to the self-hosted fontsource families
          dangerouslySetInnerHTML={{
            __html: `:root{--font-display:'Fraunces Variable';--font-body:'Manrope Variable';--font-mono:'JetBrains Mono Variable';}`,
          }}
        />
      </head>
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-patina focus:px-5 focus:py-2.5 focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>

        <AuthProvider>
          <CartProvider>
            <Header categories={categories} />
            <div className="pad-bottombar">
              <main id="main">{children}</main>
              <Footer />
            </div>
            <BottomBar />
            <LoginPrompt />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
