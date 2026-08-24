import Link from 'next/link';

export interface PolicyBlock {
  h: string;
  p: string[];
  list?: string[];
}

export default function PolicyPage({
  eyebrow,
  title,
  intro,
  updated,
  blocks,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  blocks: PolicyBlock[];
}) {
  return (
    <div className="shell py-12 lg:py-16">
      <header className="mx-auto max-w-3xl">
        <p className="stamp">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-relaxed text-muted">{intro}</p>
        <p className="mt-4 stamp">Last updated {updated}</p>
      </header>

      <div className="mx-auto mt-14 max-w-3xl">
        {blocks.map((b, i) => (
          <section key={b.h} className="border-t border-edge py-9 first:border-t-0 first:pt-0">
            <h2 className="flex gap-4 font-display text-2xl leading-snug">
              <span className="font-mono text-2xs text-patina">{String(i + 1).padStart(2, '0')}</span>
              {b.h}
            </h2>
            <div className="pl-0 sm:pl-10">
              {b.p.map((para) => (
                <p key={para.slice(0, 24)} className="mt-4 text-sm leading-relaxed text-birch/85">
                  {para}
                </p>
              ))}
              {b.list && (
                <ul className="mt-5 space-y-2.5">
                  {b.list.map((li) => (
                    <li key={li} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-patina" />
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="mx-auto mt-12 max-w-3xl text-sm text-muted">
        Something here unclear?{' '}
        <Link href="/contact" className="text-patina underline underline-offset-4">
          Ask us
        </Link>{' '}
        and we will explain it properly.
      </p>
    </div>
  );
}
