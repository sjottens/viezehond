import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { ORDER_STATUSES, STATUS_LABELS } from '@/lib/catalog';
import { euro } from '@/lib/money';
import { store } from '@/lib/store';
import type { OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TABS: [string, string][] = [['paid', 'Te verzenden'], ['shipped', 'Verzonden'], ['open', 'Wacht op betaling'], ['alle', 'Alle']];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = 'paid' } = await searchParams;
  const filter = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await store().listOrders(filter);

  return (
    <section>
      <h1>Bestellingen</h1>
      <nav className="filters">
        {TABS.map(([key, label]) => (
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
                  <td>
                    <Link href={`/admin/orders/${o.id}`}>#{o.number}</Link>
                    {o.stock_issue && <span className="warn-dot" title="Te weinig voorraad bij betaling">!</span>}
                  </td>
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
