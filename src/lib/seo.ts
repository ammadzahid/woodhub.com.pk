import type { Metadata } from 'next';
import { SITE, SHIPPING } from './site';
import type { Product, Category } from './catalog';

export const abs = (path: string) => `${SITE.url}${path.startsWith('/') ? path : '/' + path}`;

interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  noindex?: boolean;
  type?: 'website' | 'article';
}

/** One place that builds every page's <head>. Keeps titles, canonicals and OG consistent. */
export function buildMeta({
  title,
  description,
  path,
  image,
  keywords,
  noindex,
  type = 'website',
}: MetaInput): Metadata {
  const url = abs(path);
  const ogImage = image ? abs(image) : abs('/og-default.png');

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type,
      url,
      siteName: SITE.name,
      title,
      description,
      locale: SITE.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: abs('/logo.png'),
    image: abs('/og-default.png'),
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    priceRange: 'Rs 1,200 – Rs 19,500',
    currenciesAccepted: 'PKR',
    paymentAccepted: 'Cash on Delivery, JazzCash, Easypaisa, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.street,
      addressLocality: SITE.city,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    sameAs: [SITE.social.instagram, SITE.social.facebook, SITE.social.tiktok],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'en-PK',
    publisher: { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/shop?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productSchema(p: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE.url}/product/${p.slug}#product`,
    name: p.name,
    description: p.description,
    image: [abs(p.image)],
    sku: p.sku,
    mpn: p.sku,
    brand: { '@type': 'Brand', name: SITE.name },
    material: p.wood,
    category: p.category,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: p.reviews,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE.url}/product/${p.slug}`,
      priceCurrency: 'PKR',
      price: p.price,
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10),
      availability:
        p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE.url}/#organization` },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: p.price >= SHIPPING.freeOver ? 0 : SHIPPING.flatRate,
          currency: 'PKR',
        },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
        },
      },
    },
  };
}

export function itemListSchema(products: Product[], name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE.url}/product/${p.slug}`,
      name: p.name,
    })),
  };
}

export function collectionSchema(c: Category, count: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.title,
    description: c.blurb,
    url: `${SITE.url}/collections/${c.slug}`,
    isPartOf: { '@id': `${SITE.url}/#website` },
    mainEntity: { '@type': 'ItemList', numberOfItems: count },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function articleSchema(a: {
  title: string;
  description: string;
  path: string;
  published: string;
  updated: string;
  image: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    image: [abs(a.image)],
    datePublished: a.published,
    dateModified: a.updated,
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(a.path) },
  };
}
