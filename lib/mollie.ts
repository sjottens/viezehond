import 'server-only';
import createMollieClient from '@mollie/api-client';
import { db } from './db';

export function mollie() {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) throw new Error('MOLLIE_API_KEY ontbreekt in .env');
  return createMollieClient({ apiKey });
}

// Haalt de échte status op bij Mollie en werkt de bestelling bij.
// Gebruikt door de webhook én de bedankpagina. Veilig om vaker aan te roepen.
export async function syncPayment(paymentId: string) {
  const payment = await mollie().payments.get(paymentId);
  const orderId = (payment.metadata as { orderId?: string } | null)?.orderId;
  if (!orderId) return null;

  const status = String(payment.status);
  const supabase = db();

  if (status === 'paid') {
    const { error } = await supabase.rpc('mark_order_paid', { p_order_id: orderId });
    if (error) throw new Error(error.message);
  } else if (status === 'failed' || status === 'canceled' || status === 'expired') {
    await supabase.from('orders').update({ status }).eq('id', orderId).eq('status', 'open');
  }
  return status;
}
