'use client';
import { useState, type SubmitEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { ProductImage } from '@/components/ProductImage';
import { ShieldIcon } from '@/components/icons';
import { euro, shippingFor } from '@/lib/money';

export default function CheckoutPage() {
  const { items, ready, subtotal } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return <section className="page" aria-busy="true" />;
  if (items.length === 0) {
    return (
      <section className="page empty-state">
        <h1>Afrekenen</h1>
        <p>Je mandje is leeg.</p>
        <Link href="/#producten" className="btn btn-big">Bekijk de producten</Link>
      </section>
    );
  }

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customer: Object.fromEntries(f.entries()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Er ging iets mis.');
      window.location.href = data.checkoutUrl; // naar de betaalpagina
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.');
      setBusy(false);
    }
  }

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  return (
    <section className="page">
      <h1>Afrekenen</h1>
      <div className="checkout">
        <form onSubmit={onSubmit} className="form card-panel">
          <h2>Waar mag het heen?</h2>
          <label>Naam<input name="name" required autoComplete="name" maxLength={100} /></label>
          <label>E-mailadres<input name="email" type="email" required autoComplete="email" maxLength={200} /></label>
          <label>Straat en huisnummer<input name="street" required autoComplete="street-address" maxLength={150} /></label>
          <div className="row">
            <label>Postcode<input name="postalCode" required autoComplete="postal-code" maxLength={10} /></label>
            <label>Plaats<input name="city" required autoComplete="address-level2" maxLength={100} /></label>
          </div>
          <label>Land
            <select name="country" defaultValue="NL" autoComplete="country">
              <option value="NL">Nederland</option>
              <option value="BE">België</option>
            </select>
          </label>
          <label><span>Telefoon <span className="muted">(optioneel)</span></span><input name="phone" type="tel" autoComplete="tel" maxLength={30} /></label>
          <label className="check">
            <input type="checkbox" required /> <span>Ik ga akkoord met de <Link href="/voorwaarden" target="_blank">algemene voorwaarden</Link></span>
          </label>

          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-big btn-block" disabled={busy}>{busy ? 'Even geduld…' : `Betaal ${euro(total)}`}</button>
          <p className="muted secure"><ShieldIcon size={18} /> Je betaalt veilig via Mollie met iDEAL, Bancontact of creditcard.</p>
        </form>

        <aside className="summary">
          <h2>Je bestelling</h2>
          <ul className="mini-list">
            {items.map((i) => (
              <li key={i.productId}>
                <ProductImage src={i.imageUrl} name={i.name} slug={i.slug} category={i.category} className="thumb small" />
                <span>{i.quantity} × {i.name}</span>
                <strong>{euro(i.priceCents * i.quantity)}</strong>
              </li>
            ))}
          </ul>
          <dl className="totals">
            <dt>Subtotaal</dt><dd>{euro(subtotal)}</dd>
            <dt>Verzending</dt><dd>{shipping === 0 ? 'Gratis' : euro(shipping)}</dd>
            <dt className="total">Totaal</dt><dd className="total">{euro(total)}</dd>
          </dl>
          <Link href="/winkelwagen" className="link-btn small">Wijzig je mandje</Link>
        </aside>
      </div>
    </section>
  );
}
