import type { Product } from '@/lib/catalog';
import ProductCard from './ProductCard';
import Reveal from './Reveal';

export default function ProductGrid({
  products,
  priorityCount = 0,
  columns = 'grid-cols-2 lg:grid-cols-4',
}: {
  products: Product[];
  priorityCount?: number;
  columns?: string;
}) {
  return (
    <ul className={`grid gap-x-4 gap-y-9 sm:gap-x-6 ${columns}`}>
      {products.map((p, i) => (
        <Reveal as="li" key={p.slug} delay={Math.min(i, 7) * 55} className="h-full">
          <ProductCard product={p} priority={i < priorityCount} />
        </Reveal>
      ))}
    </ul>
  );
}
