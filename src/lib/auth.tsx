'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface WoodUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

/** Delivery details we remember locally so checkout fills itself in next time. */
export interface SavedAddress {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postal: string;
  notes: string;
}

const EMPTY_ADDRESS: SavedAddress = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  postal: '',
  notes: '',
};

const ADDRESS_KEY = 'woodhub.address.v1';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

interface AuthApi {
  user: WoodUser | null;
  address: SavedAddress;
  ready: boolean;
  gsiReady: boolean;
  configured: boolean;
  busy: boolean;
  error: string | null;
  /** Renders the official Google button into a container element. */
  mountButton: (el: HTMLElement | null) => void;
  signOut: () => Promise<void>;
  saveAddress: (patch: Partial<SavedAddress>) => void;
}

const AuthContext = createContext<AuthApi | null>(null);

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

let gsiPromise: Promise<void> | null = null;

function loadGsi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.id) resolve();
      else existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gsi-load-failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('gsi-load-failed'));
    document.head.appendChild(s);
  });
  return gsiPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const configured = clientId.length > 0;

  const [user, setUser] = useState<WoodUser | null>(null);
  const [address, setAddress] = useState<SavedAddress>(EMPTY_ADDRESS);
  const [ready, setReady] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialised = useRef(false);
  const pendingEl = useRef<HTMLElement | null>(null);

  /* ---- restore session + saved address ---- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stored = window.localStorage.getItem(ADDRESS_KEY);
        if (stored) setAddress({ ...EMPTY_ADDRESS, ...(JSON.parse(stored) as SavedAddress) });
      } catch {
        /* ignore unreadable storage */
      }
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const data = await res.json();
        if (alive && data.user) setUser(data.user as WoodUser);
      } catch {
        /* offline or blocked — stay signed out */
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleCredential = useCallback(async (credential: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'sign-in-failed');
      setUser(data.user as WoodUser);
      setAddress((prev) => {
        const next = {
          ...prev,
          fullName: prev.fullName || data.user.name,
          email: data.user.email,
        };
        try {
          window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    } catch {
      setError('Google sign-in did not complete. Try again, or continue as a guest.');
    } finally {
      setBusy(false);
    }
  }, []);

  /* ---- init GIS once ---- */
  useEffect(() => {
    if (!configured || initialised.current) return;
    initialised.current = true;
    loadGsi()
      .then(() => {
        if (!window.google?.accounts?.id) throw new Error('gsi-missing');
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response?.credential) void handleCredential(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          itp_support: true,
        });
        setGsiReady(true);
        if (pendingEl.current) {
          window.google.accounts.id.renderButton(pendingEl.current, buttonOptions(pendingEl.current));
          pendingEl.current = null;
        }
      })
      .catch(() => setError('Google sign-in could not load. Check your connection.'));
  }, [clientId, configured, handleCredential]);

  const mountButton = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !configured) return;
      el.innerHTML = '';
      if (window.google?.accounts?.id && gsiReady) {
        window.google.accounts.id.renderButton(el, buttonOptions(el));
      } else {
        pendingEl.current = el;
      }
    },
    [configured, gsiReady],
  );

  const signOut = useCallback(async () => {
    try {
      window.google?.accounts?.id?.disableAutoSelect();
    } catch {
      /* ignore */
    }
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setUser(null);
  }, []);

  const saveAddress = useCallback((patch: Partial<SavedAddress>) => {
    setAddress((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(ADDRESS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ user, address, ready, gsiReady, configured, busy, error, mountButton, signOut, saveAddress }),
    [user, address, ready, gsiReady, configured, busy, error, mountButton, signOut, saveAddress],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function buttonOptions(el: HTMLElement) {
  return {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    logo_alignment: 'left',
    width: Math.min(Math.max(el.clientWidth || 280, 220), 400),
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
