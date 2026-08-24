export default function Rating({
  value,
  reviews,
  size = 'sm',
}: {
  value: number;
  reviews?: number;
  size?: 'sm' | 'md';
}) {
  const px = size === 'md' ? 16 : 13;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={px} height={px} viewBox="0 0 20 20" className="shrink-0">
            <defs>
              <linearGradient id={`st${i}-${Math.round(value * 10)}`}>
                <stop offset={`${Math.max(0, Math.min(1, value - i)) * 100}%`} stopColor="#57C3A7" />
                <stop offset={`${Math.max(0, Math.min(1, value - i)) * 100}%`} stopColor="#274036" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
              fill={`url(#st${i}-${Math.round(value * 10)})`}
            />
          </svg>
        ))}
      </span>
      <span className="font-mono text-2xs text-muted">
        {value.toFixed(1)}
        {reviews !== undefined && ` (${reviews})`}
      </span>
      <span className="sr-only">{value} out of 5 stars{reviews !== undefined && `, ${reviews} reviews`}</span>
    </span>
  );
}
