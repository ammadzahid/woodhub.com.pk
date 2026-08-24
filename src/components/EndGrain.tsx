/**
 * WoodHub's signature mark: a cross-section through a log.
 * Rings are generated from a fixed seed, so server and client draw the identical
 * shape (no hydration mismatch) while still looking hand-cut rather than perfect.
 */

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function ringPath(radius: number, wobble: number, rand: () => number, points = 44) {
  const pts: string[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radius * (1 + (rand() - 0.5) * wobble);
    const x = 200 + Math.cos(angle) * r * 1.06;
    const y = 200 + Math.sin(angle) * r * 0.94;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

const rand = lcg(20260729);
const RINGS = Array.from({ length: 13 }, (_, i) => {
  const radius = 16 + i * 13.5;
  return {
    d: ringPath(radius, 0.055 + i * 0.004, rand),
    width: i % 3 === 0 ? 1.5 : 0.8,
    opacity: 0.16 + (i % 4) * 0.09,
    delay: i * 0.13,
  };
});

export default function EndGrain({
  className = '',
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {RINGS.map((r, i) => (
        <path
          key={i}
          d={r.d}
          stroke="currentColor"
          strokeWidth={r.width}
          strokeLinejoin="round"
          opacity={r.opacity}
          style={
            animate
              ? {
                  strokeDasharray: 1400,
                  strokeDashoffset: 1400,
                  animation: `ring-draw 2.4s cubic-bezier(.2,.8,.3,1) ${r.delay}s forwards`,
                }
              : undefined
          }
        />
      ))}
      {/* the pith — the first year of growth */}
      <circle cx="200" cy="200" r="3.5" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/** Horizontal end-grain rule used between sections instead of a plain <hr>. */
export function GrainRule({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-edge" />
      <svg viewBox="0 0 60 12" className="h-3 w-14 text-patina/60" fill="none">
        <path d="M2 6c6-5 10-5 16 0s10 5 16 0 10-5 16 0 8 5 8 5" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-edge" />
    </div>
  );
}
