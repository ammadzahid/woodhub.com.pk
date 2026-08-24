'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/catalog';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { SHIPPING } from '@/lib/site';
import { pkr } from '@/lib/format';
import Logo from './Logo';

const NAV = [
  { href: '/shop', label: 'Shop' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'Our workshop' },
];

export default function Header({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      {/* delivery promise strip — the one thing every PK shopper checks first */}
      <div className="bg-patina-deep/25 text-center">
        <p className="shell py-2 font-mono text-2xs uppercase tracking-stamp text-patina-soft">
          Free delivery over {pkr(SHIPPING.freeOver)} · Cash on delivery across Pakistan
        </p>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          scrolled ? 'border-edge bg-ink/92 backdrop-blur-xl' : 'border-transparent bg-ink'
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link href="/" className="shrink-0" aria-label="WoodHub home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            <div
              className="relative"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-birch/85 transition-colors hover:text-patina"
              >
                Collections
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={menuOpen ? 'rotate-180 transition-transform' : 'transition-transform'}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute left-1/2 top-full w-[42rem] -translate-x-1/2 pt-3 animate-fade">
                  <div className="card overflow-hidden p-2 shadow-lift">
                    <ul className="grid grid-cols-2 gap-1">
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/collections/${c.slug}`}
                            className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-raise"
                          >
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                              <Image src={c.cover} alt="" fill sizes="56px" className="object-cover" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-birch">{c.title}</span>
                              <span className="mt-0.5 block truncate font-mono text-2xs uppercase tracking-stamp text-muted">
                                {c.label}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith(n.href) ? 'text-patina' : 'text-birch/85 hover:text-patina'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href="/shop" aria-label="Search products" className="grid h-10 w-10 place-items-center rounded-full text-birch/80 transition-colors hover:bg-bark hover:text-patina">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.6-3.6" />
              </svg>
            </Link>

            <Link href="/account" aria-label="Your account" className="hidden h-10 w-10 place-items-center rounded-full text-birch/80 transition-colors hover:bg-bark hover:text-patina md:grid">
              {user?.picture ? (
                <Image src={user.picture} alt="" width={26} height={26} className="rounded-full" unoptimized />
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4.5 20a7.5 7.5 0 0115 0" />
                </svg>
              )}
            </Link>

            <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative grid h-10 w-10 place-items-center rounded-full text-birch/80 transition-colors hover:bg-bark hover:text-patina">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h14l-1.2 12.1a2 2 0 01-2 1.9H8.2a2 2 0 01-2-1.9z" />
                <path d="M9 7V5.5a3 3 0 016 0V7" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-patina px-1 font-mono text-2xs font-bold text-ink">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
