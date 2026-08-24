'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PRODUCTS, type Product } from './catalog';
import { SHIPPING } from './site';

export interface CartLine {
  slug: string;
  qty: number;
  engraving?: string;
}

export interface ResolvedLine extends CartLine {
  product: Product;
  lineTotal: number;
}

type Action =
  | { type: 'hydrate'; lines: CartLine[] }
  | { type: 'add'; slug: string; qty: number; engraving?: string }
  | { type: 'setQty'; slug: string; qty: number }
  | { type: 'remove'; slug: string }
  | { type: 'clear' };

const STORAGE_KEY = 'woodhub.cart.v1';

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'hydrate':
      return action.lines;
    case 'add': {
      const found = state.find((l) => l.slug === action.slug);
      if (found) {
        return state.map((l) =>
          l.slug === action.slug
            ? { ...l, qty: Math.min(l.qty + action.qty, 99), engraving: action.engraving ?? l.engraving }
            : l,
        );
      }
      return [...state, { slug: action.slug, qty: action.qty, engraving: action.engraving }];
    }
    case 'setQty':
      if (action.qty <= 0) return state.filter((l) => l.slug !== action.slug);
      return state.map((l) => (l.slug === action.slug ? { ...l, qty: Math.min(action.qty, 99) } : l));
    case 'remove':
      return state.filter((l) => l.slug !== action.slug);
    case 'clear':
      return [];
    default:
      return state;
  }
}

interface CartApi {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  shipping: number;
  freeShippingGap: number;
  ready: boolean;
  justAdded: string | null;
  add: (slug: string, qty?: number, engraving?: string) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartLine[];
        if (Array.isArray(parsed)) {
          dispatch({
            type: 'hydrate',
            lines: parsed.filter((l) => l && typeof l.slug === 'string' && l.qty > 0),
          });
        }
      }
    } catch {
      /* corrupted storage — start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch {
      /* storage full or blocked — cart still works for this session */
    }
  }, [raw, ready]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const value = useMemo<CartApi>(() => {
    const lines: ResolvedLine[] = raw
      .map((l) => {
        const product = PRODUCTS.find((p) => p.slug === l.slug);
        if (!product) return null;
        return { ...l, product, lineTotal: product.price * l.qty };
      })
      .filter(Boolean) as ResolvedLine[];

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const shipping = subtotal === 0 || subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.flatRate;

    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal,
      shipping,
      freeShippingGap: Math.max(0, SHIPPING.freeOver - subtotal),
      ready,
      justAdded,
      add: (slug, qty = 1, engraving) => {
        dispatch({ type: 'add', slug, qty, engraving });
        setJustAdded(slug);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setJustAdded(null), 2600);
      },
      setQty: (slug, qty) => dispatch({ type: 'setQty', slug, qty }),
      remove: (slug) => dispatch({ type: 'remove', slug }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [raw, ready, justAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
