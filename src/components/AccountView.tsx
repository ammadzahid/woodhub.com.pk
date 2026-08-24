'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { CITIES, SITE } from '@/lib/site';
import GoogleButton from './GoogleButton';
import EndGrain from './EndGrain';

export default function AccountView() {
  const { user, address, saveAddress, signOut, ready, configured } = useAuth();
  const [draft, setDraft] = useState(address);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(address), [address]);

  if (!ready) return <p className="stamp py-20 text-center">Checking your session…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
      {/* ---- identity ---- */}
      <div className="card relative overflow-hidden p-7">
        <EndGrain className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 text-patina opacity-[0.14]" animate={false} />

        {user ? (
          <div className="relative">
            <div className="flex items-center gap-4">
              {user.picture ? (
                <Image src={user.picture} alt="" width={56} height={56} className="rounded-full" unoptimized />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-raise font-display text-2xl text-patina">
                  {user.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl">{user.name}</h2>
                <p className="truncate stamp">{user.email}</p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted">
              You are signed in, so checkout skips straight to the delivery address.
            </p>

            <button type="button" onClick={signOut} className="btn-ghost btn-sm mt-6 w-full">
              Sign out
            </button>
          </div>
        ) : (
          <div className="relative">
            <h2 className="font-display text-2xl leading-tight">Sign in to skip the typing</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              One tap with Google and your name and email carry over to every order. Nothing is
              posted to your Google account, and we never see your password.
            </p>
            <GoogleButton className="mt-6" />
            {!configured && (
              <p className="mt-4 text-xs text-muted">
                Guest checkout works either way —{' '}
                <Link href="/shop" className="text-patina underline underline-offset-4">start shopping</Link>.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- saved address ---- */}
      <div className="card p-7">
        <h2 className="font-display text-xl">Delivery details</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Saved on this device only. Checkout fills itself in from here.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field id="acc-name" label="Full name">
            <input
              id="acc-name"
              value={draft.fullName}
              autoComplete="name"
              onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
            />
          </Field>
          <Field id="acc-phone" label="Mobile number">
            <input
              id="acc-phone"
              type="tel"
              value={draft.phone}
              autoComplete="tel"
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="03171713002"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field id="acc-email" label="Email">
              <input
                id="acc-email"
                type="email"
                value={draft.email}
                autoComplete="email"
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </Field>
          </div>
          <Field id="acc-city" label="City">
            <select
              id="acc-city"
              value={draft.city}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
            >
              <option value="">Choose your city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field id="acc-postal" label="Postal code">
            <input
              id="acc-postal"
              value={draft.postal}
              autoComplete="postal-code"
              onChange={(e) => setDraft({ ...draft, postal: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field id="acc-address" label="Street address">
              <textarea
                id="acc-address"
                rows={3}
                value={draft.address}
                autoComplete="street-address"
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              saveAddress(draft);
              setSaved(true);
              setTimeout(() => setSaved(false), 2400);
            }}
            className="btn-primary btn-sm"
          >
            Save details
          </button>
          {saved && (
            <span className="animate-fade font-mono text-2xs uppercase tracking-stamp text-patina">
              Saved
            </span>
          )}
        </div>

        <p className="mt-8 border-t border-edge pt-6 text-sm leading-relaxed text-muted">
          Need to change or cancel an order? Message us on{' '}
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-patina underline underline-offset-4"
          >
            WhatsApp
          </a>{' '}
          with your order number and we will sort it before dispatch.
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
    </div>
  );
}
