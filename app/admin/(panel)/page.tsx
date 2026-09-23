import Link from 'next/link';
import { db, type Order } from '@/lib/db';
import { STATUS_LABELS } from '@/lib/catalog';
import { euro } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'paid' } = await searchParams;
  let query = db().from('orders').select('*').order('created_at', { ascending: false }).limit(200);
  if (status !== 'alle') query = query.eq('status', status);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  const tabs = [['paid', 'Te verzenden'], ['shipped', 'Verzonden'], ['open', 'Wacht op betaling'], ['alle', 'Alle']];
  return (
    <section>
      <h1>Bestellingen</h1>
      <nav className="filters">
        {tabs.map(([key, label]) => (
          <Link key={key} href={`/admin?status=${key}`} className={status === key ? 'chip active' : 'chip'}>{label}</Link>
        ))}
      </nav>
      {orders.length === 0 ? (
        <p className="empty">Geen bestellingen in deze lijst.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nr.</th><th>Datum</th><th>Klant</th><th>Totaal</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`}>#{o.number}</Link></td>
                  <td>{new Date(o.created_at).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>{o.name}</td>
                  <td>{euro(o.total_cents)}</td>
                  <td><span className={`status ${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
