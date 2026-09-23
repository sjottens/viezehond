import Link from 'next/link';
import { db, type Product } from '@/lib/db';
import { categoryLabel } from '@/lib/catalog';
import { euro } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function ProductsAdmin() {
  const { data } = await db().from('products').select('*').order('created_at', { ascending: false });
  const products = (data ?? []) as Product[];
  return (
    <section>
      <div className="admin-head">
        <h1>Producten</h1>
        <Link href="/admin/products/new" className="btn">Product toevoegen</Link>
      </div>
      {products.length === 0 ? (
        <p className="empty">Nog geen producten. Voeg je eerste product toe.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Naam</th><th>Categorie</th><th>Prijs</th><th>Voorraad</th><th>Zichtbaar</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/admin/products/${p.id}`}>{p.name}</Link></td>
                  <td>{categoryLabel(p.category)}</td>
                  <td>{euro(p.price_cents)}</td>
                  <td className={p.stock < 5 ? 'low' : ''}>{p.stock}</td>
                  <td>{p.active ? 'Ja' : 'Nee'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
