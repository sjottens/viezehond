import Link from 'next/link';
import { euro } from '@/lib/money';
import type { Product } from '@/lib/types';
import { QuickAdd } from './AddToCart';
import { ProductImage } from './ProductImage';

export function toCartItem(p: Product) {
  return { productId: p.id, slug: p.slug, name: p.name, priceCents: p.price_cents, imageUrl: p.image_url, category: p.category, stock: p.stock };
}

export function ProductCard({ product: p }: { product: Product }) {
  const soldOut = p.stock < 1;
  return (
    <article className={soldOut ? 'card soldout' : 'card'}>
      <ProductImage src={p.image_url} name={p.name} slug={p.slug} category={p.category} />
      {soldOut && <span className="badge badge-ink">Uitverkocht</span>}
      {!soldOut && p.stock <= 5 && <span className="badge badge-pink">Nog {p.stock}!</span>}
      <div className="card-body">
        <h3 className="card-name">
          {/* De hele kaart is klikbaar via ::after op deze link */}
          <Link href={`/product/${p.slug}`}>{p.name}</Link>
        </h3>
        <p className="card-price">{euro(p.price_cents)}</p>
      </div>
      <QuickAdd product={toCartItem(p)} />
    </article>
  );
}
