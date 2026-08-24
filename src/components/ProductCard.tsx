import Image from 'next/image';
import Link from 'next/link';
import { discountPercent, type Product } from '@/lib/catalog';
import { pkr } from '@/lib/format';
import Rating from './Rating';
import QuickAdd from './QuickAdd';

export default function ProductCard({
  product,
  priority = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw',
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
}) {
  const off = discountPercent(product);

  return (
    <article className="group relative flex h-full flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden rounded-3xl border border-edge bg-raise"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={product.image}
            alt={`${product.name} — handcrafted ${product.wood.toLowerCase()} by WoodHub`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" />
        </div>

        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-patina px-2.5 py-1 font-mono text-2xs font-bold uppercase tracking-stamp text-ink">
            −{off}%
          </span>
        )}
        {product.stock <= 6 && (
          <span className="absolute right-3 top-3 rounded-full border border-edge bg-ink/80 px-2.5 py-1 font-mono text-2xs uppercase tracking-stamp text-birch backdrop-blur">
            {product.stock} left
          </span>
        )}

        {/* maker's stamp — the spec every WoodHub piece carries */}
        <p className="absolute inset-x-3 bottom-3 truncate font-mono text-2xs uppercase tracking-stamp text-birch/75">
          {product.wood} · {product.dimensions} · {product.finish}
        </p>
      </Link>

      <div className="flex flex-1 flex-col gap-2 px-1 pt-3.5">
        <h3 className="font-display text-[1.02rem] leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:text-patina transition-colors">
            {product.name}
          </Link>
        </h3>

        <Rating value={product.rating} reviews={product.reviews} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-lg text-birch">{pkr(product.price)}</span>
            {product.compareAt && (
              <span className="font-mono text-2xs text-muted line-through">
                {pkr(product.compareAt)}
              </span>
            )}
          </p>
          <QuickAdd slug={product.slug} name={product.name} />
        </div>
      </div>
    </article>
  );
}
