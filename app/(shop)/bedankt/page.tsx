import Link from 'next/link';
import { ClearCart } from '@/components/ClearCart';
import { CheckIcon } from '@/components/icons';
import { euro } from '@/lib/money';
import { syncPayment } from '@/lib/payments';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bedankt', robots: { index: false } };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  if (!orderId || !/^[0-9a-f-]{36}$/.test(orderId)) return <Missing />;

  const orders = store();
  let order = await orders.getOrder(orderId);
  if (!order) return <Missing />;

  // Status direct bij de betaalprovider checken voor het geval de webhook nog niet is binnengekomen
  if (order.status === 'open' && order.mollie_payment_id) {
    try {
      await syncPayment(order.mollie_payment_id);
      order = await orders.getOrder(orderId);
    } catch (e) {
      console.error(e);
    }
  }
  if (!order) return <Missing />;

  if (order.status === 'paid' || order.status === 'shipped') {
    return (
      <section className="page thanks">
        <ClearCart />
        <div className="celebrate" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>
        <span className="thanks-check"><CheckIcon size={44} /></span>
        <h1>Woef! Bedankt voor je bestelling.</h1>
        <p className="lede">
          Bestelling <strong>#{order.number}</strong> van {euro(order.total_cents)} is betaald. We sturen je pakket naar{' '}
          {order.street}, {order.postal_code} {order.city}.
        </p>
        <Link href="/" className="btn btn-big">Verder winkelen</Link>
      </section>
    );
  }

  if (order.status === 'open') {
    return (
      <section className="page thanks">
        <h1>We verwerken je betaling…</h1>
        <p className="lede">Dit duurt meestal een paar seconden.</p>
        <Link href={`/bedankt?order=${order.id}`} className="btn btn-big">Vernieuw de status</Link>
      </section>
    );
  }

  return (
    <section className="page thanks">
      <h1>De betaling is niet gelukt</h1>
      <p className="lede">Er is niets afgeschreven. Je producten staan nog in je mandje.</p>
      <Link href="/afrekenen" className="btn btn-big">Opnieuw afrekenen</Link>
    </section>
  );
}

function Missing() {
  return (
    <section className="page thanks">
      <h1>Bestelling niet gevonden</h1>
      <p><Link href="/">Terug naar de winkel</Link></p>
    </section>
  );
}
