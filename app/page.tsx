import Link from 'next/link';
import { db, type Product } from '@/lib/db';
import { CATEGORIES } from '@/lib/catalog';
import { euro, FREE_SHIPPING_FROM_CENTS } from '@/lib/money';
import { ProductImage } from '@/components/ProductImage';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  let query = db().from('products').select('*').eq('active', true).order('created_at');
  if (categorie) query = query.eq('category', categorie);
  const { data } = await query;
  const products = (data ?? []) as Product[];

  return (
    <>
      <section className="hero">
        <h1>Vieze hond? Zo weer schoon.</h1>
        <p>Kammen, borstels, shampoo en handdoeken om je hond thuis te wassen en te verzorgen. Gratis verzending vanaf {euro(FREE_SHIPPING_FROM_CENTS)}.</p>
        <div className="comb" aria-hidden="true" />
      </section>

      <nav className="filters" aria-label="Categorieën">
        <Link href="/" className={!categorie ? 'chip active' : 'chip'}>Alles</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/?categorie=${c.slug}`} className={categorie === c.slug ? 'chip active' : 'chip'}>
            {c.label}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="empty">Er staan nog geen producten in deze categorie.</p>
      ) : (
        <ul className="grid">
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`} className="card">
                <ProductImage src={p.image_url} name={p.name} />
                <span className="card-name">{p.name}</span>
                <span className="card-price">{euro(p.price_cents)}</span>
                {p.stock < 1 && <span className="muted">Uitverkocht</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
