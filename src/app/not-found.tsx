import Link from 'next/link';
import EndGrain from '@/components/EndGrain';

export default function NotFound() {
  return (
    <div className="shell relative py-28 text-center lg:py-40">
      <EndGrain className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 text-patina opacity-[0.12]" />
      <p className="relative stamp">Nothing at this address</p>
      <h1 className="relative mt-4 font-display text-5xl leading-tight sm:text-7xl">404</h1>
      <p className="relative mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
        This page was either moved, mistyped, or never existed. The shop is still where you left it.
      </p>
      <div className="relative mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-primary">Browse the shop</Link>
        <Link href="/" className="btn-ghost">Back to home</Link>
      </div>
    </div>
  );
}
