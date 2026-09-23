'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { ProductImage } from '@/components/ProductImage';
import { euro, shippingFor, FREE_SHIPPING_FROM_CENTS } from '@/lib/money';

export default function CartPage() {
  const { items, ready, subtotal, setQuantity, remove } = useCart();
  if (!ready) return null;

  if (items.length === 0) {
    return (
      <section className="page">
        <h1>Winkelwagen</h1>
        <p className="empty">Je winkelwagen is leeg. <Link href="/">Bekijk de producten</Link></p>
      </section>
    );
  }

  const shipping = shippingFor(subtotal);
  return (
    <section className="page">
      <h1>Winkelwagen</h1>
      <ul className="cart-list">
        {items.map((i) => (
          <li key={i.productId} className="cart-row">
            <ProductImage src={i.imageUrl} name={i.name} />
            <div>
              <Link href={`/product/${i.slug}`}>{i.name}</Link>
              <p className="muted">{euro(i.priceCents)} per stuk</p>
            </div>
            <div className="stepper">
              <button aria-label="Eén minder" onClick={() => setQuantity(i.productId, i.quantity - 1)}>−</button>
              <span>{i.quantity}</span>
              <button aria-label="Eén meer" disabled={i.quantity >= i.stock} onClick={() => setQuantity(i.productId, i.quantity + 1)}>+</button>
            </div>
            <strong>{euro(i.priceCents * i.quantity)}</strong>
            <button className="link-btn" onClick={() => remove(i.productId)}>Verwijderen</button>
          </li>
        ))}
      </ul>
      <dl className="totals">
        <dt>Subtotaal</dt><dd>{euro(subtotal)}</dd>
        <dt>Verzending</dt><dd>{shipping === 0 ? 'Gratis' : euro(shipping)}</dd>
        <dt className="total">Totaal</dt><dd className="total">{euro(subtotal + shipping)}</dd>
      </dl>
      {shipping > 0 && <p className="muted">Nog {euro(FREE_SHIPPING_FROM_CENTS - subtotal)} tot gratis verzending.</p>}
      <Link href="/afrekenen" className="btn">Afrekenen</Link>
    </section>
  );
}
