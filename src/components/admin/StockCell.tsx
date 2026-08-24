'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Table ke andar hi stock badalne ke liye — page chhodne ki zarurat nahi. */
export default function StockCell({
  id,
  stock,
  editable,
}: {
  id: string;
  stock: number;
  editable: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(stock);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function commit(next: number) {
    const clamped = Math.max(0, Math.min(9999, next));
    const previous = value;
    setValue(clamped);
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: clamped }),
      });
      if (!res.ok) {
        setValue(previous);
        setFailed(true);
      } else {
        router.refresh();
      }
    } catch {
      setValue(previous);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const tone =
    value === 0 ? 'text-red-400' : value <= 5 ? 'text-amber-300' : 'text-birch';

  if (!editable) {
    return <span className={`font-mono ${tone}`}>{value}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Reduce stock"
        disabled={busy || value <= 0}
        onClick={() => commit(value - 1)}
        className="grid h-7 w-7 place-items-center rounded-lg border border-edge text-muted transition-colors hover:border-patina hover:text-patina disabled:opacity-35"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14" /></svg>
      </button>

      <input
        type="number"
        min={0}
        value={value}
        aria-label="Stock quantity"
        disabled={busy}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={(e) => {
          const n = Number(e.target.value);
          if (n !== stock) void commit(n);
        }}
        className={`!w-16 !px-2 !py-1 text-center font-mono ${tone}`}
      />

      <button
        type="button"
        aria-label="Increase stock"
        disabled={busy}
        onClick={() => commit(value + 1)}
        className="grid h-7 w-7 place-items-center rounded-lg border border-edge text-muted transition-colors hover:border-patina hover:text-patina disabled:opacity-35"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {failed && <span className="font-mono text-2xs text-red-400">failed</span>}
    </span>
  );
}
