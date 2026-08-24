import { db, dbReady } from '../supabase';
import {
  PRODUCTS as SEED_PRODUCTS,
  CATEGORIES as SEED_CATEGORIES,
  type Product,
  type Category,
  type CategorySlug,
} from '../catalog';

export type { Product, Category, CategorySlug };

/* ------------------------------------------------------------------ mapping */

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compare_at: number | null;
  wood: string;
  dimensions: string;
  finish: string;
  wood_note: string;
  description: string;
  features: string[];
  rating: number;
  reviews_count: number;
  stock: number;
  sku: string;
  image: string;
  featured: boolean;
  personalised: boolean;
  active: boolean;
  sort_order: number;
}

function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category as CategorySlug,
    price: r.price,
    compareAt: r.compare_at,
    wood: r.wood,
    dimensions: r.dimensions,
    finish: r.finish,
    woodNote: r.wood_note,
    description: r.description,
    features: Array.isArray(r.features) ? r.features : [],
    rating: Number(r.rating),
    reviews: r.reviews_count,
    stock: r.stock,
    sku: r.sku,
    image: r.image,
    featured: r.featured,
    personalised: r.personalised,
  };
}

export function toProductRow(p: Partial<Product> & { active?: boolean }) {
  const row: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined) row[k] = v;
  };
  set('slug', p.slug);
  set('name', p.name);
  set('category', p.category);
  set('price', p.price);
  set('compare_at', p.compareAt);
  set('wood', p.wood);
  set('dimensions', p.dimensions);
  set('finish', p.finish);
  set('wood_note', p.woodNote);
  set('description', p.description);
  set('features', p.features);
  set('rating', p.rating);
  set('reviews_count', p.reviews);
  set('stock', p.stock);
  set('sku', p.sku);
  set('image', p.image);
  set('featured', p.featured);
  set('personalised', p.personalised);
  set('active', p.active);
  return row;
}

/* --------------------------------------------------------------- storefront */

/** Sirf active products — storefront ke liye. */
export async function getProducts(): Promise<Product[]> {
  if (!dbReady) return SEED_PRODUCTS;

  const { data, error } = await db()
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data || data.length === 0) {
    if (error) console.error('[woodhub] getProducts failed, using seed:', error.message);
    return SEED_PRODUCTS;
  }
  return (data as ProductRow[]).map(toProduct);
}

/** Inactive bhi — sirf admin ke liye. */
export async function getAllProducts(): Promise<(Product & { active: boolean })[]> {
  if (!dbReady) return SEED_PRODUCTS.map((p) => ({ ...p, active: true }));

  const { data, error } = await db()
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error || !data) return SEED_PRODUCTS.map((p) => ({ ...p, active: true }));
  return (data as ProductRow[]).map((r) => ({ ...toProduct(r), active: r.active }));
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!dbReady) return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;

  const { data, error } = await db().from('products').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return SEED_PRODUCTS.find((p) => p.slug === slug) ?? null;
  return toProduct(data as ProductRow);
}

export async function getProductById(id: string): Promise<(Product & { active: boolean }) | null> {
  if (!dbReady) {
    const p = SEED_PRODUCTS.find((x) => x.id === id);
    return p ? { ...p, active: true } : null;
  }
  const { data, error } = await db().from('products').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  const row = data as ProductRow;
  return { ...toProduct(row), active: row.active };
}

export async function getCategories(): Promise<Category[]> {
  if (!dbReady) return SEED_CATEGORIES;

  const { data, error } = await db()
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) return SEED_CATEGORIES;
  return data as Category[];
}

export async function getCategory(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

/* ------------------------------------------------------------ derived views */

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.category === slug);
}

export async function getFeatured(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  return [...(await getProducts())].sort((a, b) => b.reviews - a.reviews).slice(0, limit);
}

export async function getOnSale(limit = 4): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.compareAt).slice(0, limit);
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  const same = all.filter((p) => p.category === product.category && p.slug !== product.slug);
  const rest = all.filter((p) => p.category !== product.category && p.slug !== product.slug);
  return [...same, ...rest].slice(0, limit);
}

/* -------------------------------------------------------------- admin writes */

export async function createProduct(input: Partial<Product> & { active?: boolean }) {
  const { data, error } = await db().from('products').insert(toProductRow(input)).select().single();
  if (error) throw new Error(error.message);
  return toProduct(data as ProductRow);
}

export async function updateProduct(id: string, patch: Partial<Product> & { active?: boolean }) {
  const { data, error } = await db()
    .from('products')
    .update(toProductRow(patch))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toProduct(data as ProductRow);
}

export async function deleteProduct(id: string) {
  const { error } = await db().from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
