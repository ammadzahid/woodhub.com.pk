import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentAdmin } from '@/lib/admin';
import { updateOrder, ORDER_STATUSES, type OrderStatus } from '@/lib/data/orders';
import { dbReady } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  if (!(await currentAdmin())) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }
  if (!dbReady) {
    return NextResponse.json({ error: 'Database is not connected.' }, { status: 503 });
  }

  const { number } = await params;

  let body: {
    status?: string;
    admin_notes?: string;
    tracking_number?: string;
    payment_verified?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  if (body.status && !ORDER_STATUSES.some((s) => s.id === body.status)) {
    return NextResponse.json({ error: 'Unknown status.' }, { status: 422 });
  }

  try {
    const order = await updateOrder(decodeURIComponent(number), {
      status: body.status as OrderStatus | undefined,
      admin_notes: body.admin_notes?.slice(0, 2000),
      tracking_number: body.tracking_number?.slice(0, 80),
      payment_verified: body.payment_verified,
    });
    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Update failed.' },
      { status: 400 },
    );
  }
}
