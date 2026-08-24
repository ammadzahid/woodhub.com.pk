'use client';

import { useCart } from '@/lib/cart';

export default function QuickAdd({ slug, name }: { slug: string; name: string }) {
  const { add, justAdded } = useCart();
  const added = justAdded === slug;

  return (
    <button
      type="button"
      onClick={() => add(slug, 1)}
      aria-label={`Add ${name} to cart`}
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all active:scale-90 ${
        added
          ? 'border-patina bg-patina text-ink'
          : 'border-edge text-muted hover:border-patina hover:text-patina'
      }`}
    >
      {added ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
    </button>
  );
}
