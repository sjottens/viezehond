import 'server-only';
import createMollieClient from '@mollie/api-client';
import type { Payments, PaymentStatus } from './index';

export function molliePayments(): Payments {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) throw new Error('MOLLIE_API_KEY ontbreekt in .env');
  const mollie = createMollieClient({ apiKey });

  return {
    async create({ orderId, amountCents, description, redirectUrl, webhookUrl }) {
      const payment = await mollie.payments.create({
        amount: { currency: 'EUR', value: (amountCents / 100).toFixed(2) },
        description,
        redirectUrl,
        ...(webhookUrl ? { webhookUrl } : {}),
        metadata: { orderId },
      });
      const checkoutUrl = payment.getCheckoutUrl();
      if (!checkoutUrl) throw new Error('Mollie gaf geen betaallink terug');
      return { id: payment.id, checkoutUrl };
    },
    async get(id) {
      const payment = await mollie.payments.get(id);
      const orderId = (payment.metadata as { orderId?: string } | null)?.orderId ?? null;
      const paid = Number(payment.amount.value);
      const back = Number(payment.amountRefunded?.value ?? 0) + Number(payment.amountChargedBack?.value ?? 0);
      return { id: payment.id, status: String(payment.status) as PaymentStatus, orderId, refunded: paid > 0 && back >= paid };
    },
  };
}
