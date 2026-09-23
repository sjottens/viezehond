import { notFound, redirect } from 'next/navigation';
import { isDemoPayments } from '@/lib/env';
import { euro } from '@/lib/money';
import { syncPayment, type PaymentStatus } from '@/lib/payments';
import { getDemoPayment, setDemoPaymentStatus } from '@/lib/payments/demo';

// Nagebootste betaalpagina voor lokaal testen, zolang er geen MOLLIE_API_KEY is.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Demo-betaling', robots: { index: false } };

const OUTCOMES: { status: PaymentStatus; label: string; className: string }[] = [
  { status: 'paid', label: 'Betaling gelukt', className: 'btn btn-big btn-block' },
  { status: 'failed', label: 'Betaling mislukt', className: 'btn btn-ghost btn-block' },
  { status: 'canceled', label: 'Annuleren', className: 'btn btn-ghost btn-block' },
  { status: 'expired', label: 'Laten verlopen', className: 'btn btn-ghost btn-block' },
];

async function complete(formData: FormData) {
  'use server';
  if (!isDemoPayments()) notFound();
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as PaymentStatus;
  if (!OUTCOMES.some((o) => o.status === status)) notFound();

  const payment = await setDemoPaymentStatus(id, status);
  const existing = payment ?? (await getDemoPayment(id));
  if (!existing) notFound();
  await syncPayment(id); // doet wat de Mollie-webhook anders zou doen
  redirect(existing.redirectUrl);
}

export default async function DemoPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDemoPayments()) notFound();
  const { id } = await params;
  const payment = await getDemoPayment(id);
  if (!payment) notFound();

  return (
    <section className="page narrow demo-pay">
      <div className="card-panel">
        <p className="eyebrow">Demo-betaling · er wordt niets afgeschreven</p>
        <h1>{euro(payment.amountCents)}</h1>
        <p className="muted">{payment.description}</p>
        {payment.status === 'open' ? (
          <form action={complete} className="demo-choices">
            <input type="hidden" name="id" value={payment.id} />
            <p>Kies wat er gebeurt. Zo test je elke afloop zonder Mollie-account.</p>
            {OUTCOMES.map((o) => (
              <button key={o.status} name="status" value={o.status} className={o.className}>{o.label}</button>
            ))}
          </form>
        ) : (
          <form action={complete}>
            <input type="hidden" name="id" value={payment.id} />
            <p>Deze betaling is al afgerond ({payment.status}).</p>
            <button name="status" value={payment.status} className="btn btn-big btn-block">Terug naar de winkel</button>
          </form>
        )}
      </div>
    </section>
  );
}
