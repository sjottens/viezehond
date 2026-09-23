import 'server-only';
import { readJson, updateJson } from '../store/json-file';
import type { NewPayment, Payments, PaymentStatus } from './index';

// Nep-betalingen voor lokaal testen zonder Mollie-account. Staan in .data/payments.json.
export type DemoPayment = Omit<NewPayment, 'webhookUrl'> & { id: string; status: PaymentStatus; createdAt: string };
type Db = Record<string, DemoPayment>;

const FILE = 'payments.json';
const empty = (): Db => ({});

export const demoPayments: Payments = {
  async create(p) {
    const id = `tr_demo${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    await updateJson(FILE, empty, (db) => {
      db[id] = { orderId: p.orderId, amountCents: p.amountCents, description: p.description, redirectUrl: p.redirectUrl, id, status: 'open', createdAt: new Date().toISOString() };
    });
    return { id, checkoutUrl: `/demo-betaling/${id}` };
  },
  async get(id) {
    const payment = (await readJson(FILE, empty))[id];
    if (!payment) throw new Error(`Demo-betaling ${id} bestaat niet`);
    return { id, status: payment.status, orderId: payment.orderId, refunded: false };
  },
};

export async function getDemoPayment(id: string) {
  return (await readJson(FILE, empty))[id] ?? null;
}

export async function setDemoPaymentStatus(id: string, status: PaymentStatus) {
  return updateJson(FILE, empty, (db) => {
    const payment = db[id];
    if (!payment || payment.status !== 'open') return null; // net als bij Mollie: een afgeronde betaling verandert niet meer
    payment.status = status;
    return payment;
  });
}
