import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { AddToCart } from '@/components/AddToCart';
import { ProductCard, toCartItem } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { ReturnIcon, ShieldIcon, TruckIcon } from '@/components/icons';
import { category } from '@/lib/catalog';
import { euro, FREE_SHIPPING_FROM_CENTS } from '@/lib/money';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

// Eén keer ophalen voor zowel de metadata als de pagina
const getProduct = cache((slug: string) => store().getActiveProductBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return p ? { title: p.name, description: p.description.slice(0, 160) } : {};
}

function StockNote({ stock }: { stock: number }) {
  if (stock < 1) return <p className="stock out">Uitverkocht</p>;
  if (stock <= 5) return <p className="stock low">Nog maar {stock} op voorraad</p>;
  return <p className="stock in">Op voorraad</p>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const cat = category(p.category);
  const related = (await store().listProducts({ category: p.category })).filter((x) => x.id !== p.id).slice(0, 4);

  return (
    <>
      <nav className="crumbs" aria-label="Kruimelpad">
        <Link href="/">Winkel</Link> <span aria-hidden="true">/</span>{' '}
        <Link href={`/?categorie=${p.category}#producten`}>{cat?.label ?? p.category}</Link> <span aria-hidden="true">/</span>{' '}
        <span aria-current="page">{p.name}</span>
      </nav>

      <article className="product">
        <div className="product-visual">
          <ProductImage src={p.image_url} name={p.name} slug={p.slug} category={p.category} className="big" />
        </div>
        <div className="product-info">
          <Link href={`/?categorie=${p.category}#producten`} className="chip small" style={{ '--dot': cat?.color } as React.CSSProperties}>
            {cat?.label ?? p.category}
          </Link>
          <h1>{p.name}</h1>
          <p className="price">{euro(p.price_cents)} <span>incl. btw</span></p>
          <StockNote stock={p.stock} />
          <p className="description">{p.description}</p>
          <AddToCart product={toCartItem(p)} />
          <ul className="usps">
            <li><TruckIcon /> Gratis verzending vanaf {euro(FREE_SHIPPING_FROM_CENTS)}</li>
            <li><ShieldIcon /> Veilig betalen met iDEAL, Bancontact of creditcard</li>
            <li><ReturnIcon /> 14 dagen bedenktijd</li>
          </ul>
        </div>
      </article>

      {related.length > 0 && (
        <section className="related" aria-labelledby="related-title">
          <h2 id="related-title" className="section-title">Past er goed bij</h2>
          <ul className="grid">
            {related.map((r) => <li key={r.id}><ProductCard product={r} /></li>)}
          </ul>
        </section>
      )}
    </>
  );
}
