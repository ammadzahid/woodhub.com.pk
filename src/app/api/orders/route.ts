import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PRODUCTS } from '@/lib/catalog';
import { SHIPPING, PAYMENT_METHODS, type PaymentMethodId } from '@/lib/site';
import { newOrderNumber } from '@/lib/format';
import { SESSION_COOKIE, openSession } from '@/lib/session';
import { saveOrder } from '@/lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface IncomingLine {
  slug?: unknown;
  qty?: unknown;
  engraving?: unknown;
}

interface IncomingOrder {
  lines?: IncomingLine[];
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  city?: unknown;
  address?: unknown;
  postal?: unknown;
  notes?: unknown;
  payment?: unknown;
  txnId?: unknown;
}

const str = (v: unknown, max = 240) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const PHONE_RE = /^(\+92|0)?3\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: IncomingOrder;
  try {
    body = (await request.json()) as IncomingOrder;
  } catch {
    return NextResponse.json({ error: 'We could not read that order. Please try again.' }, { status: 400 });
  }

  /* ---------- lines: price is taken from the server catalog, never the client ---------- */
  const incoming = Array.isArray(body.lines) ? body.lines.slice(0, 50) : [];
  const lines = incoming
    .map((l) => {
      const product = PRODUCTS.find((p) => p.slug === str(l.slug, 120));
      const qty = Math.min(Math.max(Math.floor(Number(l.qty) || 0), 1), 99);
      if (!product) return null;
      return {
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price,
        qty,
        engraving: product.personalised ? str(l.engraving, 60) : '',
        lineTotal: product.price * qty,
      };
    })
    .filter(Boolean) as {
    slug: string;
    name: string;
    sku: string;
    unitPrice: number;
    qty: number;
    engraving: string;
    lineTotal: number;
  }[];

  if (lines.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty. Add something first.' }, { status: 400 });
  }

  /* ---------- customer ---------- */
  const fullName = str(body.fullName, 80);
  const email = str(body.email, 120).toLowerCase();
  const phone = str(body.phone, 20).replace(/[\s-]/g, '');
  const city = str(body.city, 60);
  const address = str(body.address, 400);
  const postal = str(body.postal, 12);
  const notes = str(body.notes, 500);

  const errors: Record<string, string> = {};
  if (fullName.length < 3) errors.fullName = 'Enter the full name for the delivery.';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a working email address.';
  if (!PHONE_RE.test(phone)) errors.phone = 'Enter a Pakistani mobile number, like 03171713002.';
  if (!city) errors.city = 'Choose a city.';
  if (address.length < 10) errors.address = 'Enter the full street address.';

  /* ---------- payment ---------- */
  const paymentId = str(body.payment, 20) as PaymentMethodId;
  const method = PAYMENT_METHODS.find((m) => m.id === paymentId);
  if (!method) errors.payment = 'Choose a payment method.';

  const txnId = str(body.txnId, 60);
  if (method?.needsProof && txnId.length < 4) {
    errors.txnId = 'Enter the transaction ID from your payment receipt.';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Please fix the highlighted fields.', errors }, { status: 422 });
  }

  /* ---------- totals, computed server-side ---------- */
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.flatRate;
  const codFee = paymentId === 'cod' ? SHIPPING.codFee : 0;
  const total = subtotal + shipping + codFee;

  const jar = await cookies();
  const session = openSession(jar.get(SESSION_COOKIE)?.value);

  const order = {
    number: newOrderNumber(),
    createdAt: new Date().toISOString(),
    status: paymentId === 'cod' ? ('confirmed' as const) : ('awaiting-verification' as const),
    customer: { fullName, email, phone, city, address, postal, notes },
    account: session ? { sub: session.sub, email: session.email } : null,
    payment: { method: paymentId, label: method!.label, txnId: method!.needsProof ? txnId : '' },
    lines,
    totals: { subtotal, shipping, codFee, total, currency: 'PKR' },
  };

  try {
    await saveOrder(order);
  } catch {
    // Storage is optional — never lose a sale because a webhook was down.
    console.error('[woodhub] order storage failed for', order.number);
  }

  return NextResponse.json({ order }, { status: 201 });
}
