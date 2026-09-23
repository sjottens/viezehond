import { NextResponse } from 'next/server';
import { validateCheckout, type CheckoutBody } from '@/lib/checkout';
import { baseUrl, demoPaymentsEnabled } from '@/lib/env';
import { shippingFor } from '@/lib/money';
import { payments } from '@/lib/payments';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { store } from '@/lib/store';
import type { OrderLine } from '@/lib/types';

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  if (!rateLimit(`checkout:${await clientIp()}`, 10, 60_000)) {
    return fail('Te veel pogingen. Wacht een minuutje en probeer het opnieuw.', 429);
  }

  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return fail('Ongeldig verzoek.');
  }

  // 1. Klantgegevens en winkelwagen controleren
  const checked = validateCheckout(body);
  if (!checked.ok) return fail(checked.error);
  const { customer, quantities } = checked;

  const orders = store();

  // 2. Prijzen en voorraad uit de database halen (nooit de prijs uit de browser vertrouwen)
  let products;
  try {
    products = await orders.getProductsByIds([...quantities.keys()]);
  } catch (e) {
    console.error('Producten laden mislukt', e);
    return fail('Producten konden niet worden geladen.', 500);
  }

  const lines: OrderLine[] = [];
  for (const [productId, quantity] of quantities) {
    const p = products.find((x) => x.id === productId);
    if (!p || !p.active) return fail('Een product in je winkelwagen is niet meer leverbaar. Verwijder het en probeer opnieuw.');
    if (p.stock < quantity) return fail(`Van "${p.name}" zijn er nog ${p.stock} op voorraad. Pas het aantal aan.`);
    lines.push({ product_id: p.id, name: p.name, unit_price_cents: p.price_cents, quantity });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  // 3. Bestelling opslaan
  let order;
  try {
    order = await orders.createOrder({ ...customer, subtotal_cents: subtotal, shipping_cents: shipping, total_cents: total }, lines);
  } catch (e) {
    console.error('Bestelling opslaan mislukt', e);
    return fail('Bestelling kon niet worden opgeslagen.', 500);
  }

  // 4. Betaling aanmaken
  try {
    const base = baseUrl();
    // Mollie kan localhost niet bereiken; lokaal checkt de bedankpagina de status zelf
    const reachable = !demoPaymentsEnabled() && !/localhost|127\.0\.0\.1/.test(base);
    const payment = await payments().create({
      orderId: order.id,
      amountCents: total,
      description: `Viezehond.nl bestelling #${order.number}`,
      redirectUrl: `${base}/bedankt?order=${order.id}`,
      webhookUrl: reachable ? `${base}/api/webhooks/mollie` : undefined,
    });
    await orders.setPaymentId(order.id, payment.id);
    return NextResponse.json({ checkoutUrl: payment.checkoutUrl });
  } catch (e) {
    console.error('Betaling starten mislukt', e);
    await orders.updateOrderStatus(order.id, 'failed', ['open']).catch(() => undefined);
    return fail('De betaling kon niet worden gestart. Probeer het opnieuw.', 502);
  }
}
