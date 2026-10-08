// Inhoud van de mail "nieuwe bestelling" aan de winkelier. Geen imports: wordt ook los getest.
import type { Order, OrderLine } from './types';

const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
const euro = (cents: number) => fmt.format(cents / 100);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Klantgegevens komen uit een formulier: geen regeleindes in het onderwerp
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export function orderMail(order: Order, items: OrderLine[], opts: { test: boolean; adminUrl: string }) {
  const subject = `${opts.test ? '[TEST] ' : ''}Nieuwe bestelling #${order.number} – ${euro(order.total_cents)} – ${oneLine(order.name)}`;

  const address = [order.name, order.street, `${order.postal_code} ${order.city}`, order.country];
  const contact = [order.email, order.phone].filter((x): x is string => !!x);
  const lines = items.map((i) => ({ label: `${i.quantity} × ${i.name}`, amount: euro(i.unit_price_cents * i.quantity) }));
  const totals = [
    { label: 'Subtotaal', amount: euro(order.subtotal_cents) },
    { label: 'Verzending', amount: order.shipping_cents === 0 ? 'gratis' : euro(order.shipping_cents) },
    { label: 'Totaal (incl. btw)', amount: euro(order.total_cents) },
  ];
  const warning = order.stock_issue ? 'Let op: er was te weinig voorraad toen deze betaling binnenkwam.' : null;
  const testNote = opts.test ? 'Dit is een testbestelling: er is niets betaald.' : null;

  const text = [
    testNote,
    warning,
    `Bestelling #${order.number} is betaald.`,
    '',
    ...lines.map((l) => `${l.label}  ${l.amount}`),
    '',
    ...totals.map((t) => `${t.label}: ${t.amount}`),
    '',
    'Verzenden naar:',
    ...address,
    '',
    ...contact,
    '',
    `Bekijk in het beheer: ${opts.adminUrl}`,
  ]
    .filter((l) => l !== null)
    .join('\n');

  const row = (a: string, b: string, bold = false) =>
    `<tr><td style="padding:4px 12px 4px 0${bold ? ';font-weight:bold' : ''}">${esc(a)}</td><td style="padding:4px 0;text-align:right${bold ? ';font-weight:bold' : ''}">${esc(b)}</td></tr>`;
  const note = (s: string | null, bg: string) =>
    s ? `<p style="background:${bg};padding:8px 12px;border-radius:6px">${esc(s)}</p>` : '';

  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:520px">
${note(testNote, '#fff3c4')}${note(warning, '#ffd9d9')}
<h2 style="margin:0 0 12px">Bestelling #${order.number} is betaald</h2>
<table style="border-collapse:collapse;width:100%">
${lines.map((l) => row(l.label, l.amount)).join('\n')}
<tr><td colspan="2" style="border-top:1px solid #ddd;padding-top:4px"></td></tr>
${totals.map((t, i) => row(t.label, t.amount, i === totals.length - 1)).join('\n')}
</table>
<h3 style="margin:20px 0 4px">Verzenden naar</h3>
<p style="margin:0">${address.map(esc).join('<br>')}</p>
<p style="margin:8px 0 0">${contact.map(esc).join('<br>')}</p>
<p style="margin:20px 0 0"><a href="${esc(opts.adminUrl)}">Bekijk in het beheer</a></p>
</div>`;

  return { subject, text, html };
}
