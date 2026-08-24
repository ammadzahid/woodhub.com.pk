'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { pkr, cx } from '@/lib/format';
import { SHIPPING, CITIES, PAYMENT_METHODS, PAYMENT_ACCOUNTS, type PaymentMethodId } from '@/lib/site';
import GoogleButton from './GoogleButton';
import { CheckoutSkeleton } from './Skeleton';

type FieldErrors = Record<string, string>;

export default function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, shipping, count, clear, ready } = useCart();
  const { user, address, saveAddress, configured } = useAuth();

  const [payment, setPayment] = useState<PaymentMethodId>('cod');
  const [txnId, setTxnId] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  /* Google sign-in fills these in; the saved copy fills them next time. */
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    postal: '',
    notes: '',
  });

  useEffect(() => {
    setForm((prev) => ({
      fullName: prev.fullName || address.fullName,
      email: prev.email || address.email,
      phone: prev.phone || address.phone,
      city: prev.city || address.city,
      address: prev.address || address.address,
      postal: prev.postal || address.postal,
      notes: prev.notes || address.notes,
    }));
  }, [address]);

  const method = PAYMENT_METHODS.find((m) => m.id === payment)!;
  const codFee = payment === 'cod' ? SHIPPING.codFee : 0;
  const total = subtotal + shipping + codFee;

  const emptied = ready && lines.length === 0;

  const accountBlock = useMemo(() => {
    if (payment === 'jazzcash') return { rows: [['Account title', PAYMENT_ACCOUNTS.jazzcash.title], ['JazzCash number', PAYMENT_ACCOUNTS.jazzcash.number]] };
    if (payment === 'easypaisa') return { rows: [['Account title', PAYMENT_ACCOUNTS.easypaisa.title], ['Easypaisa number', PAYMENT_ACCOUNTS.easypaisa.number]] };
    if (payment === 'bank')
      return {
        rows: [
          ['Account title', PAYMENT_ACCOUNTS.bank.title],
          ['Bank', PAYMENT_ACCOUNTS.bank.bank],
          ['IBAN', PAYMENT_ACCOUNTS.bank.number],
          ['Branch', PAYMENT_ACCOUNTS.bank.branch],
        ],
      };
    return null;
  }, [payment]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  }

  async function placeOrder() {
    setSubmitting(true);
    setBanner(null);
    setErrors({});

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          payment,
          txnId,
          lines: lines.map((l) => ({ slug: l.slug, qty: l.qty, engraving: l.engraving })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        setBanner(data.error || 'That did not go through. Check the fields and try again.');
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      saveAddress(form);
      try {
        sessionStorage.setItem('woodhub.last-order', JSON.stringify(data.order));
      } catch {
        /* confirmation page falls back to a generic message */
      }
      clear();
      router.push(`/order/${data.order.number}`);
    } catch {
      setBanner('We could not reach the server. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  if (!ready) return <CheckoutSkeleton />;

  if (emptied) {
    return (
      <div className="card px-7 py-20 text-center">
        <h2 className="font-display text-3xl">There is nothing to check out</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          Add a piece to your cart and this page will fill itself in.
        </p>
        <Link href="/shop" className="btn-primary mt-8">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
      <div>
        {banner && (
          <div role="alert" className="mb-7 rounded-2xl border border-patina/50 bg-patina/10 px-5 py-4 text-sm text-birch">
            {banner}
          </div>
        )}

        {/* ---- 1. who ---- */}
        <Step n={1} title="Who is it for">
          {user ? (
            <div className="flex items-center gap-3.5 rounded-2xl border border-edge bg-bark p-4">
              {user.picture ? (
                <Image src={user.picture} alt="" width={40} height={40} className="rounded-full" unoptimized />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-full bg-raise font-display text-patina">
                  {user.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate stamp">{user.email}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-patina/15 px-3 py-1 font-mono text-2xs uppercase tracking-stamp text-patina">
                Filled in
              </span>
            </div>
          ) : (
            configured && (
              <div className="rounded-2xl border border-edge bg-bark p-5">
                <p className="text-sm text-muted">
                  Sign in with Google and your name and email fill themselves in. Or just type them
                  below — no account needed.
                </p>
                <GoogleButton className="mt-4" />
              </div>
            )
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.fullName}>
              <input
                id="fullName"
                value={form.fullName}
                autoComplete="name"
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Ahmed Raza"
              />
            </Field>
            <Field label="Mobile number" error={errors.phone} hint="We text the tracking link here">
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                autoComplete="tel"
                onChange={(e) => set('phone', e.target.value)}
                placeholder="03171713002"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
            </div>
          </div>
        </Step>

        {/* ---- 2. where ---- */}
        <Step n={2} title="Where it goes">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" error={errors.city}>
              <select
                id="city"
                value={form.city}
                autoComplete="address-level2"
                onChange={(e) => set('city', e.target.value)}
              >
                <option value="">Choose your city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Postal code" hint="Optional">
              <input
                id="postal"
                value={form.postal}
                autoComplete="postal-code"
                onChange={(e) => set('postal', e.target.value)}
                placeholder="54000"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Street address" error={errors.address} hint="House or flat number, street, area">
                <textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  autoComplete="street-address"
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="House 12, Street 4, Gulberg III"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Notes for the rider" hint="Optional">
                <input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Call before arriving, gate is on the side street"
                />
              </Field>
            </div>
          </div>
        </Step>

        {/* ---- 3. pay ---- */}
        <Step n={3} title="How you pay" last>
          <fieldset>
            <legend className="sr-only">Payment method</legend>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <li key={m.id}>
                  <label
                    className={cx(
                      'flex h-full cursor-pointer gap-3 rounded-2xl border p-4 transition-colors',
                      payment === m.id ? 'border-patina bg-patina/10' : 'border-edge bg-bark hover:border-muted/50',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={payment === m.id}
                      onChange={() => { setPayment(m.id); setErrors((e) => ({ ...e, txnId: '', payment: '' })); }}
                      className="sr-only"
                    />
                    <span
                      className={cx(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                        payment === m.id ? 'border-patina' : 'border-edge',
                      )}
                      aria-hidden="true"
                    >
                      {payment === m.id && <span className="h-2.5 w-2.5 rounded-full bg-patina" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{m.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">{m.note}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          {accountBlock && (
            <div className="mt-5 rounded-2xl border border-edge bg-bark p-5">
              <p className="stamp">Send {pkr(total)} to</p>
              <dl className="mt-4 space-y-2.5">
                {accountBlock.rows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-muted">{k}</dt>
                    <dd className="flex items-center gap-2 text-right">
                      <span className="font-mono text-sm">{v}</span>
                      <button
                        type="button"
                        onClick={() => copy(v, k)}
                        aria-label={`Copy ${k}`}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-edge text-muted transition-colors hover:border-patina hover:text-patina"
                      >
                        {copied === k ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>
                        )}
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5">
                <Field
                  label={payment === 'bank' ? 'Reference number' : 'Transaction ID'}
                  error={errors.txnId}
                  hint="From the SMS or receipt after you send the payment"
                >
                  <input
                    id="txnId"
                    value={txnId}
                    onChange={(e) => { setTxnId(e.target.value); setErrors((er) => ({ ...er, txnId: '' })); }}
                    placeholder="e.g. 4839201756"
                  />
                </Field>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted">
                We check the payment against this ID before dispatch, usually within a couple of
                working hours. You will get a confirmation on WhatsApp either way.
              </p>
            </div>
          )}

          {payment === 'cod' && (
            <p className="mt-5 rounded-2xl border border-edge bg-bark p-5 text-sm leading-relaxed text-muted">
              The rider collects {pkr(total)} in cash when the parcel arrives. Please keep the exact
              amount ready — riders often cannot break large notes.
            </p>
          )}
        </Step>
      </div>

      {/* ---- summary rail ---- */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-7">
          <h2 className="font-display text-xl">Your order</h2>

          <ul className="mt-5 max-h-64 space-y-4 overflow-y-auto pr-1">
            {lines.map((l) => (
              <li key={l.slug} className="flex gap-3.5">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-edge">
                  <Image src={l.product.image} alt="" fill sizes="56px" className="object-cover" />
                  <span className="absolute right-0 top-0 grid h-5 min-w-[1.25rem] place-items-center rounded-bl-lg bg-ink/85 px-1 font-mono text-2xs">
                    {l.qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{l.product.name}</span>
                  {l.engraving && (
                    <span className="mt-0.5 block truncate font-mono text-2xs text-patina">“{l.engraving}”</span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-sm">{pkr(l.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-edge pt-5 text-sm">
            <Row k={`Subtotal (${count} ${count === 1 ? 'item' : 'items'})`} v={pkr(subtotal)} />
            <Row k="Delivery" v={shipping === 0 ? 'Free' : pkr(shipping)} accent={shipping === 0} />
            {codFee > 0 && <Row k="Cash handling" v={pkr(codFee)} />}
            <div className="flex justify-between border-t border-edge pt-3.5 font-display text-lg">
              <dt>Total</dt>
              <dd className="text-patina">{pkr(total)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={placeOrder}
            disabled={submitting}
            className="btn-primary mt-7 w-full"
          >
            {submitting ? 'Placing your order…' : `Place order · ${pkr(total)}`}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-muted">
            By placing this order you agree to our{' '}
            <Link href="/terms" className="text-patina underline underline-offset-4">terms</Link> and{' '}
            <Link href="/privacy" className="text-patina underline underline-offset-4">privacy notice</Link>.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Step({
  n,
  title,
  children,
  last,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={cx('relative pl-11', !last && 'pb-10')}>
      <span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border border-patina/50 bg-bark font-mono text-2xs text-patina">
        {n}
      </span>
      {!last && <span className="absolute left-4 top-9 h-[calc(100%-2.5rem)] w-px bg-edge" aria-hidden="true" />}
      <h2 className="pt-1 font-display text-xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactElement<{ id?: string; 'aria-invalid'?: boolean }>;
}) {
  const id = children.props.id;
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {error ? (
        <p className="mt-2 text-xs text-patina-soft" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className={accent ? 'text-patina' : undefined}>{v}</dd>
    </div>
  );
}
