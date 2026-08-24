'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/data/orders';
import { cx } from '@/lib/format';

export default function OrderControls({
  orderNumber,
  status,
  notes,
  tracking,
  verified,
  needsVerification,
}: {
  orderNumber: string;
  status: OrderStatus;
  notes: string;
  tracking: string;
  verified: boolean;
  needsVerification: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<OrderStatus>(status);
  const [noteText, setNoteText] = useState(notes);
  const [trackText, setTrackText] = useState(tracking);
  const [isVerified, setIsVerified] = useState(verified);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>, optimistic?: () => void) {
    setBusy(true);
    setError(null);
    setSaved(false);
    optimistic?.();
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save.');
        router.refresh();
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
        router.refresh();
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg">Manage this order</h2>

      {/* status */}
      <div className="mt-6">
        <p className="field-label">Status</p>
        <ul className="space-y-1.5">
          {ORDER_STATUSES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ status: s.id }, () => setCurrent(s.id))}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-60',
                  current === s.id
                    ? 'border-patina bg-patina/10 text-patina'
                    : 'border-edge text-birch hover:border-muted/60',
                )}
              >
                <span
                  className={cx(
                    'grid h-4 w-4 shrink-0 place-items-center rounded-full border-2',
                    current === s.id ? 'border-patina' : 'border-edge',
                  )}
                  aria-hidden="true"
                >
                  {current === s.id && <span className="h-1.5 w-1.5 rounded-full bg-patina" />}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* payment verification */}
      {needsVerification && (
        <div className="mt-6 border-t border-edge pt-6">
          <p className="field-label">Payment</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ payment_verified: !isVerified }, () => setIsVerified(!isVerified))}
            className={cx('btn w-full border px-5 py-3 text-sm', isVerified
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
              : 'border-edge text-birch hover:border-patina hover:text-patina')}
          >
            {isVerified ? '✓ Payment verified — tap to undo' : 'Mark payment as verified'}
          </button>
        </div>
      )}

      {/* tracking */}
      <div className="mt-6 border-t border-edge pt-6">
        <label htmlFor="tracking" className="field-label">
          Tracking number
        </label>
        <input
          id="tracking"
          value={trackText}
          onChange={(e) => setTrackText(e.target.value)}
          placeholder="Courier tracking ID"
        />
      </div>

      {/* notes */}
      <div className="mt-5">
        <label htmlFor="admin-notes" className="field-label">
          Internal notes
        </label>
        <textarea
          id="admin-notes"
          rows={4}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Only staff see this"
        />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => patch({ admin_notes: noteText, tracking_number: trackText })}
        className="btn-primary btn-sm mt-5 w-full"
      >
        {busy ? 'Saving…' : 'Save notes and tracking'}
      </button>

      {saved && <p className="mt-3 text-center text-sm text-patina">Saved</p>}
      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
