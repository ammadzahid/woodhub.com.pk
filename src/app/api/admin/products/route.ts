import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { currentAdmin } from '@/lib/admin';
import { createProduct } from '@/lib/data/products';
import { dbReady } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await currentAdmin())) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }
  if (!dbReady) {
    return NextResponse.json({ error: 'Database is not connected.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    if (!body.slug || !body.name || typeof body.price !== 'number') {
      return NextResponse.json(
        { error: 'Slug, name and price are all required.' },
        { status: 422 },
      );
    }
    const product = await createProduct(body);
    revalidatePath('/shop');
    revalidatePath('/admin/products');
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not create that product.' },
      { status: 400 },
    );
  }
}
