import { db, dbReady } from '../supabase';
import type { Order, OrderLine } from '../order-types';

export type OrderStatus =
  | 'awaiting-verification'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUSES: { id: OrderStatus; label: string; tone: string }[] = [
  { id: 'awaiting-verification', label: 'Awaiting payment', tone: 'amber' },
  { id: 'confirmed', label: 'Confirmed', tone: 'patina' },
  { id: 'packed', label: 'Packed', tone: 'patina' },
  { id: 'shipped', label: 'Shipped', tone: 'patina' },
  { id: 'delivered', label: 'Delivered', tone: 'green' },
  { id: 'cancelled', label: 'Cancelled', tone: 'red' },
];

export interface OrderRecord {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer: Order['customer'];
  customer_id: string | null;
  account_sub: string | null;
  payment_method: string;
  payment_txn_id: string;
  payment_verified_at: string | null;
  lines: OrderLine[];
  item_count: number;
  subtotal: number;
  shipping: number;
  cod_fee: number;
  total: number;
  admin_notes: string;
  tracking_number: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerRecord {
  id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  orders_count: number;
  total_spent: number;
  first_order_at: string | null;
  last_order_at: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------- writes */

/**
 * Order ko DB me likhta hai, customer record banata hai aur stock kam karta hai.
 * DB configured na ho to chup-chaap false return karta hai — sale kabhi fail nahi hoti.
 */
export async function persistOrder(order: Order): Promise<boolean> {
  if (!dbReady) return false;

  const supabase = db();
  const itemCount = order.lines.reduce((n, l) => n + l.qty, 0);

  let customerId: string | null = null;
  try {
    const { data } = await supabase.rpc('record_customer', {
      p_email: order.customer.email,
      p_name: order.customer.fullName,
      p_phone: order.customer.phone,
      p_city: order.customer.city,
      p_address: order.customer.address,
      p_sub: order.account?.sub ?? null,
      p_total: order.totals.total,
      p_when: order.createdAt,
    });
    customerId = (data as string) ?? null;
  } catch (e) {
    console.error('[woodhub] record_customer failed:', e);
  }

  const { error } = await supabase.from('orders').insert({
    order_number: order.number,
    status: order.status,
    customer: order.customer,
    customer_id: customerId,
    account_sub: order.account?.sub ?? null,
    payment_method: order.payment.method,
    payment_txn_id: order.payment.txnId,
    lines: order.lines,
    item_count: itemCount,
    subtotal: order.totals.subtotal,
    shipping: order.totals.shipping,
    cod_fee: order.totals.codFee,
    total: order.totals.total,
    created_at: order.createdAt,
  });

  if (error) {
    console.error('[woodhub] order insert failed:', error.message);
    return false;
  }

  try {
    await supabase.rpc('apply_stock', { p_lines: order.lines });
  } catch (e) {
    console.error('[woodhub] apply_stock failed:', e);
  }

  return true;
}

/* -------------------------------------------------------------------- reads */

export interface OrderQuery {
  status?: OrderStatus | '';
  payment?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export async function listOrders(q: OrderQuery = {}) {
  if (!dbReady) return { orders: [] as OrderRecord[], total: 0 };

  const perPage = Math.min(Math.max(q.perPage ?? 25, 1), 100);
  const page = Math.max(q.page ?? 1, 1);
  const from = (page - 1) * perPage;

  let query = db().from('orders').select('*', { count: 'exact' });

  if (q.status) query = query.eq('status', q.status);
  if (q.payment) query = query.eq('payment_method', q.payment);
  if (q.search?.trim()) {
    const s = q.search.trim();
    query = query.or(
      `order_number.ilike.%${s}%,customer->>fullName.ilike.%${s}%,customer->>phone.ilike.%${s}%,customer->>email.ilike.%${s}%`,
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) {
    console.error('[woodhub] listOrders failed:', error.message);
    return { orders: [], total: 0 };
  }
  return { orders: (data ?? []) as OrderRecord[], total: count ?? 0 };
}

export async function getOrder(orderNumber: string): Promise<OrderRecord | null> {
  if (!dbReady) return null;
  const { data, error } = await db()
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (error || !data) return null;
  return data as OrderRecord;
}

/** Customer ki apni order history — /account page ke liye. */
export async function getOrdersForAccount(sub: string, email: string) {
  if (!dbReady) return [] as OrderRecord[];
  const { data, error } = await db()
    .from('orders')
    .select('*')
    .or(`account_sub.eq.${sub},customer->>email.eq.${email}`)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) return [];
  return (data ?? []) as OrderRecord[];
}

/* ------------------------------------------------------------- admin writes */

export async function updateOrder(
  orderNumber: string,
  patch: {
    status?: OrderStatus;
    admin_notes?: string;
    tracking_number?: string;
    payment_verified?: boolean;
  },
) {
  const supabase = db();
  const existing = await getOrder(orderNumber);
  if (!existing) throw new Error('Order not found.');

  const row: Record<string, unknown> = {};
  if (patch.status) row.status = patch.status;
  if (patch.admin_notes !== undefined) row.admin_notes = patch.admin_notes;
  if (patch.tracking_number !== undefined) row.tracking_number = patch.tracking_number;
  if (patch.payment_verified !== undefined) {
    row.payment_verified_at = patch.payment_verified ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(row)
    .eq('order_number', orderNumber)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Cancel karne par stock wapas, aur cancel undo karne par dobara kam.
  const wasCancelled = existing.status === 'cancelled';
  const nowCancelled = (patch.status ?? existing.status) === 'cancelled';
  if (!wasCancelled && nowCancelled) {
    await supabase.rpc('restore_stock', { p_lines: existing.lines }).then(null, () => null);
  } else if (wasCancelled && !nowCancelled) {
    await supabase.rpc('apply_stock', { p_lines: existing.lines }).then(null, () => null);
  }

  return data as OrderRecord;
}

/* ---------------------------------------------------------------- customers */

export async function listCustomers(search = '', page = 1, perPage = 30) {
  if (!dbReady) return { customers: [] as CustomerRecord[], total: 0 };

  const from = (page - 1) * perPage;
  let query = db().from('customers').select('*', { count: 'exact' });
  if (search.trim()) {
    const s = search.trim();
    query = query.or(`email.ilike.%${s}%,name.ilike.%${s}%,phone.ilike.%${s}%,city.ilike.%${s}%`);
  }

  const { data, error, count } = await query
    .order('last_order_at', { ascending: false, nullsFirst: false })
    .range(from, from + perPage - 1);

  if (error) return { customers: [], total: 0 };
  return { customers: (data ?? []) as CustomerRecord[], total: count ?? 0 };
}

/* ---------------------------------------------------------------- dashboard */

export interface DashboardStats {
  range_days: number;
  revenue: number;
  revenue_prev: number;
  orders: number;
  orders_prev: number;
  items_sold: number;
  customers: number;
  new_customers: number;
  awaiting: number;
  to_ship: number;
  by_status: Record<string, number>;
  by_payment: Record<string, number>;
  daily: { day: string; revenue: number; orders: number }[];
  top_products: { slug: string; name: string; qty: number; revenue: number }[];
  low_stock: { slug: string; name: string; stock: number }[];
}

export async function getDashboard(days = 30): Promise<DashboardStats | null> {
  if (!dbReady) return null;
  const { data, error } = await db().rpc('admin_dashboard', { p_days: days });
  if (error) {
    console.error('[woodhub] admin_dashboard failed:', error.message);
    return null;
  }
  return data as DashboardStats;
}
