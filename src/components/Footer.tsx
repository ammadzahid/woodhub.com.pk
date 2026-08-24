import Link from 'next/link';
import { getCategories } from '@/lib/data/products';
import { SITE, SHIPPING } from '@/lib/site';
import { pkr } from '@/lib/format';
import Logo from './Logo';
import { GrainRule } from './EndGrain';

const HELP = [
  { href: '/shipping', label: 'Delivery & returns' },
  { href: '/faq', label: 'Questions' },
  { href: '/contact', label: 'Contact us' },
  { href: '/account', label: 'Your orders' },
];

const COMPANY = [
  { href: '/about', label: 'Our workshop' },
  { href: '/guides', label: 'Care guides' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export default async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="mt-24 border-t border-edge bg-bark/50">
      <div className="shell py-14">
        <div className="grid gap-11 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              We cut, carve and finish sheesham, walnut and acacia in {SITE.city}, then send it
              anywhere in Pakistan. Nothing here is mass-pressed board.
            </p>
            <div className="mt-5 flex gap-2.5">
              {[
                { href: SITE.social.instagram, label: 'Instagram', d: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.4A6.4 6.4 0 1018.4 12 6.4 6.4 0 0012 5.6zm0 10.6A4.2 4.2 0 1116.2 12 4.2 4.2 0 0112 16.2zm6.6-10.9a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5z' },
                { href: SITE.social.facebook, label: 'Facebook', d: 'M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0014.3 3.4c-2.4 0-4 1.45-4 4.15V9.9H7.6V13h2.7v8z' },
                { href: SITE.social.tiktok, label: 'TikTok', d: 'M16.5 2.5h-3v13a2.6 2.6 0 11-2.6-2.6c.24 0 .47.03.7.09V9.9a5.9 5.9 0 00-.7-.04A5.65 5.65 0 1016.55 15.5V9.05a6.7 6.7 0 003.95 1.27V7.25a3.85 3.85 0 01-4-4.75z' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="grid h-10 w-10 place-items-center rounded-full border border-edge text-muted transition-colors hover:border-patina hover:text-patina"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={categories.map((c) => ({ href: `/collections/${c.slug}`, label: c.title }))} />
          <FooterCol title="Help" links={HELP} />
          <FooterCol title="WoodHub" links={COMPANY} />
        </div>

        <GrainRule className="my-11" />

        <div className="grid gap-7 md:grid-cols-3">
          <FooterFact
            label="Delivery"
            body={`Free over ${pkr(SHIPPING.freeOver)}. Otherwise ${pkr(SHIPPING.flatRate)} flat. ${SHIPPING.etaCountry} nationwide.`}
          />
          <FooterFact
            label="Ways to pay"
            body="Cash on delivery, JazzCash, Easypaisa, bank transfer."
          />
          <FooterFact
            label="Talk to us"
            body={
              <>
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="link-quiet block">{SITE.phone}</a>
                <a href={`mailto:${SITE.email}`} className="link-quiet block">{SITE.email}</a>
              </>
            }
          />
        </div>
      </div>

      <div className="border-t border-edge">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="font-mono text-2xs uppercase tracking-stamp text-muted">
            © {new Date().getFullYear()} {SITE.legalName}
          </p>
          <p className="font-mono text-2xs uppercase tracking-stamp text-muted">
            Cut and finished in {SITE.city}, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="stamp">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm link-quiet">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterFact({ label, body }: { label: string; body: React.ReactNode }) {
  return (
    <div>
      <h2 className="stamp">{label}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted">{body}</div>
    </div>
  );
}
