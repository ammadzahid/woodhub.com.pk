import { ORDER_STATUSES, type OrderStatus } from '@/lib/data/orders';

const TONES: Record<string, string> = {
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  patina: 'border-patina/40 bg-patina/10 text-patina',
  green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  red: 'border-red-500/40 bg-red-500/10 text-red-300',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUSES.find((s) => s.id === status);
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-2xs uppercase tracking-stamp ${
        TONES[meta?.tone ?? 'patina']
      }`}
    >
      {meta?.label ?? status}
    </span>
  );
}
