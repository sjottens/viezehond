import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { STATUS_LABELS } from '@/lib/catalog';
import { euro } from '@/lib/money';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

async function markShipped(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  await store().updateOrderStatus(id, 'shipped', ['paid']);
  revalidatePath(`/admin/orders/${id}`);
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const orders = store();
  const order = await orders.getOrder(id);
  if (!order) notFound();
  const items = await orders.getOrderItems(id);

  return (
    <section>
      <p><Link href="/admin">← Terug naar bestellingen</Link></p>
      <h1>Bestelling #{order.number}</h1>
      <p><span className={`status ${order.status}`}>{STATUS_LABELS[order.status]}</span></p>

      {order.stock_issue && (
        <p className="alert" role="alert">
          Let op: toen deze betaling binnenkwam was er te weinig voorraad. Controleer of je alles kunt leveren
          voordat je verzendt, en neem anders contact op met de klant.
        </p>
      )}

      <div className="admin-cols">
        <div className="panel">
          <h2>Verzendadres</h2>
          <address>
            {order.name}<br />{order.street}<br />{order.postal_code} {order.city}<br />{order.country}
          </address>
          <p>{order.email}{order.phone ? <><br />{order.phone}</> : null}</p>
        </div>
        <div className="panel">
          <h2>Producten</h2>
          <ul className="plain">
            {items.map((i) => (
              <li key={i.id}>{i.quantity} × {i.name} <span className="muted">{euro(i.unit_price_cents * i.quantity)}</span></li>
            ))}
          </ul>
          <dl className="totals">
            <dt>Subtotaal</dt><dd>{euro(order.subtotal_cents)}</dd>
            <dt>Verzending</dt><dd>{euro(order.shipping_cents)}</dd>
            <dt className="total">Totaal</dt><dd className="total">{euro(order.total_cents)}</dd>
          </dl>
        </div>
      </div>

      {order.status === 'paid' && (
        <form action={markShipped}>
          <input type="hidden" name="id" value={order.id} />
          <button className="btn">Markeer als verzonden</button>
        </form>
      )}
      {order.mollie_payment_id && <p className="muted">Betaling: {order.mollie_payment_id}</p>}
    </section>
  );
}
