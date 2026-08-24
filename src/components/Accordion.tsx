'use client';

import { useState } from 'react';

export default function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="divide-y divide-edge border-y border-edge">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-5 py-5 text-left"
              >
                <span className="font-display text-lg leading-snug">{item.q}</span>
                <span
                  className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    isOpen ? 'rotate-45 border-patina text-patina' : 'border-edge text-muted'
                  }`}
                  aria-hidden="true"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              hidden={!isOpen}
              className="pb-5 pr-12 text-sm leading-relaxed text-muted"
            >
              {item.a}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
