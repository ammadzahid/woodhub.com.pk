/** Placeholder shown while the cart reads from browser storage on first paint. */
export function LineSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-edge border-y border-edge" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-4 py-5 sm:gap-6">
          <span className="h-24 w-20 shrink-0 animate-pulse rounded-2xl bg-raise sm:h-28 sm:w-24" />
          <span className="flex flex-1 flex-col gap-3 pt-1">
            <span className="h-4 w-2/5 animate-pulse rounded bg-raise" />
            <span className="h-3 w-1/4 animate-pulse rounded bg-raise" />
            <span className="mt-auto h-9 w-28 animate-pulse rounded-full bg-raise" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PanelSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="card p-7" aria-hidden="true">
      <span className="block h-5 w-1/3 animate-pulse rounded bg-raise" />
      <div className="mt-6 space-y-3.5">
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className="block h-3.5 animate-pulse rounded bg-raise" style={{ width: `${90 - i * 9}%` }} />
        ))}
      </div>
      <span className="mt-7 block h-12 animate-pulse rounded-full bg-raise" />
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
      <div className="space-y-10" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="pl-11">
            <span className="block h-6 w-40 animate-pulse rounded bg-raise" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((j) => (
                <span key={j} className="block h-[3.25rem] animate-pulse rounded-xl bg-raise" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <PanelSkeleton lines={4} />
    </div>
  );
}
