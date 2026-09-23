'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { FreeShippingBar } from '@/components/FreeShippingBar';
import { ProductImage } from '@/components/ProductImage';
import { Stepper } from '@/components/Stepper';
import { ArrowIcon } from '@/components/icons';
import { euro, shippingFor } from '@/lib/money';

export default function CartPage() {
  const { items, ready, subtotal, setQuantity, remove } = useCart();
  if (!ready) return <section className="page" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <section className="page empty-state">
        <h1>Je mandje is leeg</h1>
        <p>Nog niks gevonden? Je hond heeft vast een idee.</p>
        <Link href="/#producten" className="btn btn-big">Bekijk de producten <ArrowIcon /></Link>
      </section>
    );
  }

  const shipping = shippingFor(subtotal);
  return (
    <section className="page">
      <h1>Winkelwagen</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((i) => (
            <li key={i.productId} className="cart-row">
              <ProductImage src={i.imageUrl} name={i.name} slug={i.slug} category={i.category} className="thumb" />
              <div className="cart-info">
                <Link href={`/product/${i.slug}`} className="cart-name">{i.name}</Link>
                <p className="muted">{euro(i.priceCents)} per stuk</p>
                <button type="button" className="link-btn small" onClick={() => remove(i.productId)}>Verwijderen</button>
              </div>
              <Stepper value={i.quantity} max={i.stock} onChange={(n) => setQuantity(i.productId, n)} label={i.name} />
              <strong className="cart-line">{euro(i.priceCents * i.quantity)}</strong>
            </li>
          ))}
        </ul>
        <aside className="summary">
          <FreeShippingBar subtotal={subtotal} />
          <dl className="totals">
            <dt>Subtotaal</dt><dd>{euro(subtotal)}</dd>
            <dt>Verzending</dt><dd>{shipping === 0 ? 'Gratis' : euro(shipping)}</dd>
            <dt className="total">Totaal</dt><dd className="total">{euro(subtotal + shipping)}</dd>
          </dl>
          <Link href="/afrekenen" className="btn btn-big btn-block">Afrekenen <ArrowIcon /></Link>
        </aside>
      </div>
    </section>
  );
}
