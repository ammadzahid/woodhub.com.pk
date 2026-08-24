'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';

const TABS = [
  {
    href: '/',
    label: 'Home',
    match: (p: string) => p === '/',
    icon: (
      <>
        <path d="M4 11.2L12 4l8 7.2" />
        <path d="M6 10.5V20h12v-9.5" />
      </>
    ),
  },
  {
    href: '/shop',
    label: 'Shop',
    match: (p: string) => p.startsWith('/shop') || p.startsWith('/collections') || p.startsWith('/product'),
    icon: (
      <>
        <path d="M5 7h14l-1 12.2a2 2 0 01-2 1.8H8a2 2 0 01-2-1.8z" />
        <path d="M9 7V5.5a3 3 0 016 0V7" />
      </>
    ),
  },
  {
    href: '/cart',
    label: 'Cart',
    match: (p: string) => p.startsWith('/cart') || p.startsWith('/checkout'),
    badge: true,
    icon: (
      <>
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M2.5 3.5h2.6l2.3 11.1a1.6 1.6 0 001.6 1.3h8.7a1.6 1.6 0 001.6-1.3L21 7H6" />
      </>
    ),
  },
  {
    href: '/account',
    label: 'Account',
    match: (p: string) => p.startsWith('/account') || p.startsWith('/order'),
    icon: (
      <>
        <circle cx="12" cy="8" r="3.8" />
        <path d="M4.6 20a7.4 7.4 0 0114.8 0" />
      </>
    ),
  },
];

export default function BottomBar() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-ink/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex h-[4.25rem] max-w-lg items-stretch">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className="relative flex h-full flex-col items-center justify-center gap-1 transition-colors"
              >
                <span
                  className={`absolute top-0 h-[2px] rounded-full bg-patina transition-all duration-300 ${
                    active ? 'w-9 opacity-100' : 'w-0 opacity-0'
                  }`}
                />
                <span className="relative">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 ${
                      active ? 'text-patina -translate-y-0.5' : 'text-muted'
                    }`}
                  >
                    {tab.icon}
                  </svg>
                  {tab.badge && count > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 grid h-[1.05rem] min-w-[1.05rem] place-items-center rounded-full bg-patina px-1 font-mono text-[0.6rem] font-bold text-ink">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </span>
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-stamp transition-colors ${
                    active ? 'text-patina' : 'text-muted'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
