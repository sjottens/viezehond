import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db, type Product } from '@/lib/db';
import { categoryLabel } from '@/lib/catalog';
import { euro } from '@/lib/money';
import { AddToCart } from '@/components/AddToCart';
import { ProductImage } from '@/components/ProductImage';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await db().from('products').select('*').eq('slug', slug).eq('active', true).maybeSingle();
  if (!data) notFound();
  const p = data as Product;

  return (
    <article className="product">
      <ProductImage src={p.image_url} name={p.name} />
      <div className="product-info">
        <Link href={`/?categorie=${p.category}`} className="muted">{categoryLabel(p.category)}</Link>
        <h1>{p.name}</h1>
        <p className="price">{euro(p.price_cents)} <span className="muted">incl. btw</span></p>
        <p className="description">{p.description}</p>
        <AddToCart
          product={{ productId: p.id, slug: p.slug, name: p.name, priceCents: p.price_cents, imageUrl: p.image_url, stock: p.stock }}
        />
      </div>
    </article>
  );
}
