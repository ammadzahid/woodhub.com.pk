export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0 text-patina" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.4" opacity=".35" />
        <circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeWidth="1.1" opacity=".55" />
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.1" opacity=".8" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
      {!compact && (
        <span className="font-display text-[1.35rem] font-semibold leading-none tracking-tight text-birch">
          Wood<span className="text-patina">Hub</span>
        </span>
      )}
    </span>
  );
}
