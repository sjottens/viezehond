import 'server-only';
import { demoPaymentsEnabled } from '../env';
import { store } from '../store';
import { demoPayments } from './demo';
import { molliePayments } from './mollie';

export type PaymentStatus = 'open' | 'pending' | 'authorized' | 'paid' | 'failed' | 'canceled' | 'expired';

export type Payment = {
  id: string;
  status: PaymentStatus;
  orderId: string | null;
  /** Het volledige bedrag is terugbetaald (of teruggeboekt). */
  refunded: boolean;
};

export type NewPayment = {
  orderId: string;
  amountCents: number;
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
};

export interface Payments {
  create(p: NewPayment): Promise<{ id: string; checkoutUrl: string }>;
  get(id: string): Promise<Payment>;
}

export function payments(): Payments {
  return demoPaymentsEnabled() ? demoPayments : molliePayments();
}

/**
 * Haalt de échte status op bij de betaalprovider en werkt de bestelling bij.
 * Gebruikt door de webhook én de bedankpagina. Veilig om vaker aan te roepen.
 */
export async function syncPayment(paymentId: string) {
  const payment = await payments().get(paymentId);
  if (!payment.orderId) return null;
  const orders = store();

  if (payment.status === 'paid') {
    await orders.markOrderPaid(payment.orderId);
    if (payment.refunded) await orders.updateOrderStatus(payment.orderId, 'refunded', ['paid', 'shipped']);
  } else if (payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired') {
    await orders.updateOrderStatus(payment.orderId, payment.status, ['open']);
  }
  return payment.status;
}
