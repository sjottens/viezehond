import type { Product } from '@/lib/db';
import { CATEGORIES } from '@/lib/catalog';
import { saveProduct } from './actions';

export function ProductForm({ product }: { product?: Product }) {
  return (
    <form action={saveProduct} className="form">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image_url" value={product?.image_url ?? ''} />
      <label>Naam<input name="name" required defaultValue={product?.name} /></label>
      <label>Slug (webadres, leeg = automatisch)<input name="slug" defaultValue={product?.slug} /></label>
      <div className="row">
        <label>Prijs in euro, incl. btw<input name="price" inputMode="decimal" required defaultValue={product ? (product.price_cents / 100).toFixed(2) : ''} /></label>
        <label>Voorraad<input name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} /></label>
      </div>
      <label>Categorie
        <select name="category" defaultValue={product?.category ?? 'kammen'}>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </label>
      <label>Omschrijving<textarea name="description" rows={5} defaultValue={product?.description} /></label>
      <label>Foto {product?.image_url && <span className="muted">(leeg laten = huidige houden)</span>}
        <input name="image" type="file" accept="image/*" />
      </label>
      <label className="check"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Zichtbaar in de winkel</label>
      <button className="btn">{product ? 'Wijzigingen opslaan' : 'Product toevoegen'}</button>
    </form>
  );
}
