import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentAdmin } from '@/lib/admin';
import { updateProduct, deleteProduct, getProductById } from '@/lib/data/products';
import { dbReady } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function guard() {
  if (!(await currentAdmin())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (!dbReady) return NextResponse.json({ error: 'Database is not connected.' }, { status: 503 });
  return null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;

  const { id } = await params;
  try {
    const body = await request.json();
    const product = await updateProduct(id, body);
    revalidatePath('/shop');
    revalidatePath(`/product/${product.slug}`);
    revalidatePath('/admin/products');
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Update failed.' },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guard();
  if (blocked) return blocked;

  const { id } = await params;
  try {
    const existing = await getProductById(id);
    await deleteProduct(id);
    revalidatePath('/shop');
    if (existing) revalidatePath(`/product/${existing.slug}`);
    revalidatePath('/admin/products');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Delete failed.' },
      { status: 400 },
    );
  }
}
