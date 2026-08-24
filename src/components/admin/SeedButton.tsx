'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** catalog.ts ka seed data Supabase me push karta hai. Idempotent hai. */
export default function SeedButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || 'Seeding failed.');
      } else {
        setMsg(`Imported ${data.products} products across ${data.categories} categories.`);
        router.refresh();
      }
    } catch {
      setErr('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={run} disabled={busy} className="btn-primary btn-sm">
        {busy ? 'Importing…' : 'Import the seed catalogue'}
      </button>
      {msg && <p className="mt-3 text-sm text-patina">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      <p className="mt-3 stamp">Safe to run twice — it matches on slug</p>
    </div>
  );
}
