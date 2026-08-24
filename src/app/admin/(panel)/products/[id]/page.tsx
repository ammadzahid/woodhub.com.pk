import { notFound } from 'next/navigation';
import { getProductById, getCategories } from '@/lib/data/products';
import { dbReady } from '@/lib/supabase';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await getCategories();

  if (id === 'new') {
    if (!dbReady) notFound();
    return <ProductForm categories={categories} />;
  }

  const product = await getProductById(id);
  if (!product) notFound();

  return <ProductForm product={product} categories={categories} />;
}
