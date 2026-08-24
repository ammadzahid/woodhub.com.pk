'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import GoogleButton from './GoogleButton';
import EndGrain from './EndGrain';

const SNOOZE_KEY = 'woodhub.login-prompt.snoozed-until';
const SCROLL_TRIGGER = 0.5; // half the page
const TIME_TRIGGER = 35_000; // or 35 seconds, whichever lands first
const SNOOZE_DAYS = 7;

/** Suppressed where a sign-in prompt would get in the way of an active task. */
const QUIET_ROUTES = ['/checkout', '/account', '/cart'];

export default function LoginPrompt() {
  const { user, ready, configured } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const armed = useRef(true);
  const closeRef = useRef<HTMLButtonElement>(null);

  const quiet = QUIET_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (!ready || user || !configured || quiet || !armed.current) return;

    try {
      const until = Number(window.localStorage.getItem(SNOOZE_KEY) || 0);
      if (until > Date.now()) return;
    } catch {
      /* storage blocked — just show it once this session */
    }

    let timer: ReturnType<typeof setTimeout>;

    const fire = () => {
      if (!armed.current) return;
      armed.current = false;
      setOpen(true);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY / max >= SCROLL_TRIGGER) fire();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    timer = setTimeout(fire, TIME_TRIGGER);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [ready, user, configured, quiet]);

  // Signing in closes it.
  useEffect(() => {
    if (user) setOpen(false);
  }, [user]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(
        SNOOZE_KEY,
        String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      <button
        type="button"
        aria-label="Close sign-in prompt"
        onClick={dismiss}
        className="absolute inset-0 animate-fade bg-ink/80 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md animate-sheet-up overflow-hidden rounded-t-4xl border border-edge bg-bark p-7 pb-9 shadow-lift sm:animate-rise sm:rounded-4xl sm:pb-7">
        <EndGrain
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 text-patina opacity-[0.18]"
          animate={false}
        />

        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-raise hover:text-birch"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="stamp">Save yourself the typing</p>
        <h2 id="login-prompt-title" className="mt-2.5 font-display text-2xl leading-tight">
          Sign in once, skip the delivery form forever
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your name, email and last delivery address fill themselves in at checkout, and every order
          you place stays in one place.
        </p>

        <GoogleButton className="mt-6" />

        <button
          type="button"
          onClick={dismiss}
          className="mt-4 w-full text-center font-mono text-2xs uppercase tracking-stamp text-muted transition-colors hover:text-birch"
        >
          Keep browsing as a guest
        </button>
      </div>
    </div>
  );
}
