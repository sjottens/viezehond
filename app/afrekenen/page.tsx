'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { euro, shippingFor } from '@/lib/money';

export default function CheckoutPage() {
  const { items, ready, subtotal } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return null;
  if (items.length === 0) {
    return (
      <section className="page">
        <h1>Afrekenen</h1>
        <p className="empty">Je winkelwagen is leeg. <Link href="/">Bekijk de producten</Link></p>
      </section>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
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
      window.location.href = data.checkoutUrl; // naar de betaalpagina van Mollie
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.');
      setBusy(false);
    }
  }

  const shipping = shippingFor(subtotal);
  return (
    <section className="page checkout">
      <h1>Afrekenen</h1>
      <form onSubmit={onSubmit} className="form">
        <label>Naam<input name="name" required autoComplete="name" /></label>
        <label>E-mailadres<input name="email" type="email" required autoComplete="email" /></label>
        <label>Straat en huisnummer<input name="street" required autoComplete="street-address" /></label>
        <div className="row">
          <label>Postcode<input name="postalCode" required autoComplete="postal-code" /></label>
          <label>Plaats<input name="city" required autoComplete="address-level2" /></label>
        </div>
        <label>Land
          <select name="country" defaultValue="NL">
            <option value="NL">Nederland</option>
            <option value="BE">België</option>
          </select>
        </label>
        <label>Telefoon (optioneel)<input name="phone" type="tel" autoComplete="tel" /></label>
        <label className="check">
          <input type="checkbox" required /> Ik ga akkoord met de <Link href="/voorwaarden" target="_blank">algemene voorwaarden</Link>
        </label>

        <dl className="totals">
          <dt>Subtotaal</dt><dd>{euro(subtotal)}</dd>
          <dt>Verzending</dt><dd>{shipping === 0 ? 'Gratis' : euro(shipping)}</dd>
          <dt className="total">Totaal</dt><dd className="total">{euro(subtotal + shipping)}</dd>
        </dl>

        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Even geduld…' : `Betaal ${euro(subtotal + shipping)}`}</button>
        <p className="muted">Je betaalt veilig via Mollie met iDEAL, Bancontact of creditcard.</p>
      </form>
    </section>
  );
}
