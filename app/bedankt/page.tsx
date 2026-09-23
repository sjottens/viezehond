import Link from 'next/link';
import { db, type Order } from '@/lib/db';
import { syncPayment } from '@/lib/mollie';
import { euro } from '@/lib/money';
import { ClearCart } from '@/components/ClearCart';

export const dynamic = 'force-dynamic';

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  if (!orderId || !/^[0-9a-f-]{36}$/.test(orderId)) return <Missing />;

  const supabase = db();
  let { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle<Order>();
  if (!order) return <Missing />;

  // Status direct bij Mollie checken voor het geval de webhook nog niet is binnengekomen
  if (order.status === 'open' && order.mollie_payment_id) {
    try {
      await syncPayment(order.mollie_payment_id);
      ({ data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle<Order>());
    } catch (e) {
      console.error(e);
    }
  }
  if (!order) return <Missing />;

  if (order.status === 'paid' || order.status === 'shipped') {
    return (
      <section className="page">
        <ClearCart />
        <h1>Bedankt voor je bestelling</h1>
        <p>Bestelling #{order.number} van {euro(order.total_cents)} is betaald. We sturen je pakket naar {order.street}, {order.postal_code} {order.city}.</p>
        <Link href="/" className="btn">Verder winkelen</Link>
      </section>
    );
  }

  if (order.status === 'open') {
    return (
      <section className="page">
        <h1>We verwerken je betaling</h1>
        <p>Dit duurt meestal een paar seconden. <Link href={`/bedankt?order=${order.id}`}>Vernieuw de pagina</Link> om de status te zien.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>De betaling is niet gelukt</h1>
      <p>Er is niets afgeschreven. Je producten staan nog in je winkelwagen.</p>
      <Link href="/afrekenen" className="btn">Opnieuw afrekenen</Link>
    </section>
  );
}

function Missing() {
  return (
    <section className="page">
      <h1>Bestelling niet gevonden</h1>
      <p><Link href="/">Terug naar de winkel</Link></p>
    </section>
  );
}
