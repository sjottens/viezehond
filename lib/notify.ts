import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { baseUrl, isDemoPayments } from './env';
import { orderMail } from './order-mail';
import { store } from './store';
import { DATA_DIR } from './store/json-file';

// Mail aan de winkelier zodra een bestelling betaald is. Remmen tegen een volle inbox:
// - alleen naar het ene adres in ORDER_NOTIFY_EMAIL, nooit naar wat een klant invult
// - alleen bij betaalde bestellingen, en per bestelling maar één keer (notified_at)
// - hooguit MAX_PER_HOUR / MAX_PER_DAY mails; daarboven alleen een regel in de log
const MAX_PER_HOUR = 10;
const MAX_PER_DAY = 30;
const HOUR = 60 * 60 * 1000;

function recipient() {
  const to = process.env.ORDER_NOTIFY_EMAIL?.trim();
  if (!to) return null;
  if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(to)) {
    console.warn('ORDER_NOTIFY_EMAIL is geen enkel geldig e-mailadres; er gaat geen bestelmail uit.');
    return null;
  }
  return to;
}

async function sentRecently() {
  const now = Date.now();
  const times = (await store().listOrders())
    .map((o) => (o.notified_at ? now - Date.parse(o.notified_at) : Infinity))
    .filter((age) => age < 24 * HOUR);
  return { hour: times.filter((age) => age < HOUR).length, day: times.length };
}

export async function notifyOrderPaid(orderId: string) {
  try {
    const to = recipient();
    if (!to) return;

    const recent = await sentRecently();
    const overLimit = recent.hour >= MAX_PER_HOUR || recent.day >= MAX_PER_DAY;

    const orders = store();
    if (!(await orders.claimOrderNotification(orderId))) return; // al gemaild
    const order = await orders.getOrder(orderId);
    if (!order) return;

    if (overLimit) {
      console.warn(`Bestelmail #${order.number} niet verstuurd: limiet van ${MAX_PER_HOUR} per uur / ${MAX_PER_DAY} per dag bereikt.`);
      return;
    }

    const mail = orderMail(order, await orders.getOrderItems(orderId), {
      test: isDemoPayments() || !!process.env.MOLLIE_API_KEY?.startsWith('test_'),
      adminUrl: `${baseUrl()}/admin/orders/${order.id}`,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Nog geen mailaccount: lokaal als bestand bewaren, zodat je ziet wat er verstuurd zou worden
      if (process.env.NODE_ENV !== 'production') {
        const dir = path.join(DATA_DIR, 'mails');
        await fs.mkdir(dir, { recursive: true });
        const file = path.join(dir, `bestelling-${order.number}.html`);
        await fs.writeFile(file, `<!doctype html><meta charset="utf-8"><title>${order.number}</title>\n<p><b>Aan:</b> ${to}<br><b>Onderwerp:</b> ${mail.subject}</p><hr>\n${mail.html}`);
        console.log(`Bestelmail (niet verstuurd, geen RESEND_API_KEY): ${file}`);
      } else {
        console.warn('RESEND_API_KEY ontbreekt; bestelmail niet verstuurd.');
      }
      return;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Resend verstuurt dezelfde sleutel nooit twee keer, ook niet bij een dubbele aanroep
        'Idempotency-Key': `order-${order.id}`,
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'Viezehond <onboarding@resend.dev>',
        to: [to],
        reply_to: order.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
    });
    if (!res.ok) console.error(`Bestelmail #${order.number} mislukt: ${res.status} ${await res.text()}`);
  } catch (e) {
    // Een mislukte mail mag de betaling nooit in de weg zitten
    console.error('Bestelmail mislukt', e);
  }
}
