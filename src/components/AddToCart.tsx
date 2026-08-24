'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/catalog';
import { SITE } from '@/lib/site';

const MAX_ENGRAVING = 24;

export default function AddToCart({ product }: { product: Product }) {
  const { add, justAdded } = useCart();
  const [qty, setQty] = useState(1);
  const [engraving, setEngraving] = useState('');
  const added = justAdded === product.slug;
  const soldOut = product.stock <= 0;

  return (
    <div className="mt-8">
      {product.personalised && (
        <div className="mb-5">
          <label htmlFor="engraving" className="field-label">
            Text to engrave <span className="text-patina">(optional)</span>
          </label>
          <input
            id="engraving"
            type="text"
            value={engraving}
            maxLength={MAX_ENGRAVING}
            onChange={(e) => setEngraving(e.target.value)}
            placeholder="e.g. Ahmed & Sana · 2026"
            aria-describedby="engraving-help"
          />
          <p id="engraving-help" className="mt-2 flex justify-between stamp">
            <span>Engraved before dispatch, adds no delay</span>
            <span>{engraving.length}/{MAX_ENGRAVING}</span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center rounded-full border border-edge">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Reduce quantity"
            disabled={qty <= 1}
            className="grid h-12 w-12 place-items-center rounded-l-full text-muted transition-colors hover:text-patina disabled:opacity-35"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14" /></svg>
          </button>
          <span aria-live="polite" className="w-9 text-center font-mono text-sm">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
            aria-label="Increase quantity"
            className="grid h-12 w-12 place-items-center rounded-r-full text-muted transition-colors hover:text-patina"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>

        <button
          type="button"
          disabled={soldOut}
          onClick={() => add(product.slug, qty, engraving.trim() || undefined)}
          className="btn-primary min-w-[13rem] flex-1 !py-3.5"
        >
          {soldOut ? 'Sold out for now' : added ? 'Added to your cart' : 'Add to cart'}
        </button>
      </div>

      {added && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-patina/40 bg-patina/10 px-5 py-3.5 animate-fade">
          <p className="flex-1 text-sm text-birch">
            {qty} × {product.name} is in your cart.
          </p>
          <Link href="/cart" className="btn-ghost btn-sm !border-patina !text-patina">
            Go to cart
          </Link>
        </div>
      )}

      <a
        href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
          `Hi WoodHub, I want to ask about the ${product.name} (${product.sku}).`,
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-stamp text-muted transition-colors hover:text-patina"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5 0a6.5 6.5 0 01-3.2-2.8c-.2-.4.2-.4.6-1.2a.5.5 0 000-.5c0-.1-.5-1.3-.7-1.7s-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4 5.3 5.3 0 002.4.4 2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.2-.2-.4-.3z" />
        </svg>
        Ask about this piece on WhatsApp
      </a>
    </div>
  );
}
