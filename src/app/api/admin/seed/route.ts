import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentAdmin } from '@/lib/admin';
import { db, dbReady } from '@/lib/supabase';
import { PRODUCTS, CATEGORIES } from '@/lib/catalog';
import { toProductRow } from '@/lib/data/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * catalog.ts ka seed data Supabase me daalta hai. Idempotent hai — slug par
 * upsert karta hai, is liye dobara chalane se duplicate nahi bante.
 */
export async function POST() {
  if (!(await currentAdmin())) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }
  if (!dbReady) {
    return NextResponse.json({ error: 'Database is not connected.' }, { status: 503 });
  }

  const supabase = db();

  const catRows = CATEGORIES.map((c, i) => ({
    slug: c.slug,
    label: c.label,
    title: c.title,
    blurb: c.blurb,
    cover: c.cover,
    sort_order: i,
  }));

  const { error: catError } = await supabase
    .from('categories')
    .upsert(catRows, { onConflict: 'slug' });
  if (catError) {
    return NextResponse.json(
      { error: `Categories failed: ${catError.message}` },
      { status: 400 },
    );
  }

  const productRows = PRODUCTS.map((p, i) => ({
    ...toProductRow({ ...p, active: true }),
    sort_order: i,
  }));

  const { error: prodError } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'slug' });
  if (prodError) {
    return NextResponse.json({ error: `Products failed: ${prodError.message}` }, { status: 400 });
  }

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin/products');

  return NextResponse.json({
    ok: true,
    categories: catRows.length,
    products: productRows.length,
  });
}
