import type { Order } from './order-types';
import { persistOrder } from './data/orders';

export type { Order, OrderLine } from './order-types';

/**
 * Order sink. Do jagah jata hai, dono optional:
 *   1. Supabase  (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) — orders table,
 *      customer record aur stock decrement bhi yahi karta hai
 *   2. Webhook   (ORDER_WEBHOOK_URL) — Zapier / Make / n8n / Google Sheets
 * Dono khali hon to order server log me jata hai.
 * Storage fail ho jaye to bhi sale kabhi fail nahi hoti.
 */
export async function saveOrder(order: Order): Promise<void> {
  const webhook = process.env.ORDER_WEBHOOK_URL;

  const jobs: Promise<unknown>[] = [persistOrder(order)];

  if (webhook) {
    jobs.push(
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }),
    );
  }

  const [stored] = await Promise.allSettled(jobs);
  const savedToDb = stored.status === 'fulfilled' && stored.value === true;

  if (!savedToDb && !webhook) {
    console.log(
      '[woodhub] new order (not stored — no DB or webhook configured)',
      order.number,
      order.totals.total,
      order.payment.method,
    );
  }
}
