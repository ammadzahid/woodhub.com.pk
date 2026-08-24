import { pkr } from '@/lib/format';

interface Point {
  day: string;
  revenue: number;
  orders: number;
}

/** Pure SVG — koi chart library nahi, koi client JS nahi. */
export default function RevenueChart({ data }: { data: Point[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="grid h-56 place-items-center rounded-2xl border border-dashed border-edge">
        <p className="stamp">No orders in this period yet</p>
      </div>
    );
  }

  const W = 900;
  const H = 240;
  const PAD = { top: 16, right: 8, bottom: 26, left: 8 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const barW = Math.max(2, (innerW / data.length) * 0.62);
  const step = innerW / data.length;

  const points = data.map((d, i) => {
    const x = PAD.left + step * i + step / 2;
    const y = PAD.top + innerH - (d.revenue / max) * innerH;
    return { ...d, x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  const area = `${line}L${points[points.length - 1].x.toFixed(1)},${PAD.top + innerH}L${points[0].x.toFixed(1)},${PAD.top + innerH}Z`;

  const total = data.reduce((s, d) => s + d.revenue, 0);
  const peak = points.reduce((a, b) => (b.revenue > a.revenue ? b : a), points[0]);

  const labelEvery = Math.ceil(data.length / 7);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-display text-2xl">{pkr(total)}</p>
        <p className="stamp">
          Peak {pkr(peak.revenue)} on {new Date(peak.day).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Revenue over the last ${data.length} days, totalling ${pkr(total)}`}
      >
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#57C3A7" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#57C3A7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + innerH - innerH * f}
            y2={PAD.top + innerH - innerH * f}
            stroke="#274036"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        ))}

        {points.map((p) => (
          <rect
            key={p.day}
            x={p.x - barW / 2}
            y={p.y}
            width={barW}
            height={Math.max(0, PAD.top + innerH - p.y)}
            rx={Math.min(3, barW / 2)}
            fill="#57C3A7"
            opacity="0.16"
          />
        ))}

        <path d={area} fill="url(#rev-fill)" />
        <path d={line} fill="none" stroke="#57C3A7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        <circle cx={peak.x} cy={peak.y} r="4" fill="#57C3A7" />

        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text
              key={`l${p.day}`}
              x={p.x}
              y={H - 6}
              textAnchor="middle"
              fill="#93A79C"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
            >
              {new Date(p.day).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

/** Chhoti horizontal breakdown bar — payment / status splits ke liye. */
export function SplitBar({ data, total }: { data: Record<string, number>; total: number }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0 || total === 0) {
    return <p className="stamp">Nothing yet</p>;
  }

  const shades = ['#57C3A7', '#2E8C75', '#8FDCC7', '#93A79C', '#274036', '#1D3028'];

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-edge">
        {entries.map(([k, v], i) => (
          <span
            key={k}
            style={{ width: `${(v / total) * 100}%`, background: shades[i % shades.length] }}
            title={`${k}: ${v}`}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {entries.map(([k, v], i) => (
          <li key={k} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: shades[i % shades.length] }}
              />
              <span className="truncate capitalize text-muted">{k.replace(/-/g, ' ')}</span>
            </span>
            <span className="shrink-0 font-mono text-2xs">
              {v} · {Math.round((v / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
