export default function StatCard({
  label,
  value,
  sub,
  delta,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number | null;
  accent?: boolean;
}) {
  const up = typeof delta === 'number' && delta > 0;
  const down = typeof delta === 'number' && delta < 0;

  return (
    <div className={`card p-5 ${accent ? 'border-patina/50 bg-patina/5' : ''}`}>
      <p className="stamp">{label}</p>
      <p className="mt-2.5 font-display text-3xl leading-none text-birch">{value}</p>
      <div className="mt-2.5 flex items-center gap-2">
        {typeof delta === 'number' && Number.isFinite(delta) && (
          <span
            className={`inline-flex items-center gap-1 font-mono text-2xs ${
              up ? 'text-patina' : down ? 'text-red-400' : 'text-muted'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={down ? 'rotate-180' : ''}>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <span className="font-mono text-2xs text-muted">{sub}</span>}
      </div>
    </div>
  );
}
