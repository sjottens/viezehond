import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mollie } from '@/lib/mollie';
import { shippingFor } from '@/lib/money';

type Body = {
  items?: { productId: string; quantity: number }[];
  customer?: {
    name?: string; email?: string; street?: string; postalCode?: string;
    city?: string; country?: string; phone?: string;
  };
};

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail('Ongeldig verzoek.');
  }

  // 1. Klantgegevens controleren
  const c = body.customer ?? {};
  const customer = {
    name: (c.name ?? '').trim(),
    email: (c.email ?? '').trim().toLowerCase(),
    street: (c.street ?? '').trim(),
    postal_code: (c.postalCode ?? '').trim().toUpperCase(),
    city: (c.city ?? '').trim(),
    country: c.country ?? 'NL',
    phone: (c.phone ?? '').trim() || null,
  };
  if (!customer.name || !customer.street || !customer.postal_code || !customer.city) {
    return fail('Vul je naam en volledige adres in.');
  }
  if (!/^\S+@\S+\.\S+$/.test(customer.email)) return fail('Vul een geldig e-mailadres in.');
  if (!['NL', 'BE'].includes(customer.country)) return fail('We verzenden alleen naar Nederland en België.');

  // 2. Winkelwagen samenvoegen en controleren
  const qty = new Map<string, number>();
  for (const i of body.items ?? []) {
    if (typeof i.productId !== 'string' || !Number.isInteger(i.quantity) || i.quantity < 1) continue;
    qty.set(i.productId, Math.min((qty.get(i.productId) ?? 0) + i.quantity, 50));
  }
  if (qty.size === 0) return fail('Je winkelwagen is leeg.');

  const supabase = db();

  // 3. Prijzen en voorraad uit de database halen (nooit de prijs uit de browser vertrouwen)
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price_cents, stock, active')
    .in('id', [...qty.keys()]);
  if (error || !products) return fail('Producten konden niet worden geladen.', 500);

  const lines = [];
  for (const [productId, quantity] of qty) {
    const p = products.find((x) => x.id === productId);
    if (!p || !p.active) return fail('Een product in je winkelwagen is niet meer leverbaar. Verwijder het en probeer opnieuw.');
    if (p.stock < quantity) return fail(`Van "${p.name}" zijn er nog ${p.stock} op voorraad. Pas het aantal aan.`);
    lines.push({ product_id: p.id, name: p.name, unit_price_cents: p.price_cents, quantity });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  // 4. Bestelling opslaan
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ ...customer, subtotal_cents: subtotal, shipping_cents: shipping, total_cents: total })
    .select('id, number')
    .single();
  if (orderError || !order) return fail('Bestelling kon niet worden opgeslagen.', 500);

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsError) return fail('Bestelling kon niet worden opgeslagen.', 500);

  // 5. Betaling aanmaken bij Mollie
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const isLocal = base.includes('localhost') || base.includes('127.0.0.1');

  try {
    const payment = await mollie().payments.create({
      amount: { currency: 'EUR', value: (total / 100).toFixed(2) },
      description: `Viezehond.nl bestelling #${order.number}`,
      redirectUrl: `${base}/bedankt?order=${order.id}`,
      // Mollie kan localhost niet bereiken; lokaal checkt de bedankpagina de status zelf
      ...(isLocal ? {} : { webhookUrl: `${base}/api/webhooks/mollie` }),
      metadata: { orderId: order.id },
    });

    await supabase.from('orders').update({ mollie_payment_id: payment.id }).eq('id', order.id);
    return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() });
  } catch (e) {
    console.error('Mollie error', e);
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return fail('De betaling kon niet worden gestart. Probeer het opnieuw.', 502);
  }
}
