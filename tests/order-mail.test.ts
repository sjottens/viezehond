import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderMail } from '../lib/order-mail.ts';
import type { Order } from '../lib/types.ts';

const order: Order = {
  id: 'abc', number: 1004, status: 'paid', name: 'Sanne <b>de Vries</b>\r\nBcc: x@y.nl', email: 'sanne@example.com',
  street: 'Modderpad 12', postal_code: '3511 AB', city: 'Utrecht', country: 'NL', phone: null,
  subtotal_cents: 3585, shipping_cents: 495, total_cents: 4080, mollie_payment_id: 'tr_demo1', stock_deducted: true,
  stock_issue: false, created_at: '', paid_at: '', shipped_at: null, notified_at: null,
};
const items = [{ product_id: 'p1', name: 'Slickerborstel', unit_price_cents: 1750, quantity: 2 }];
const opts = { test: true, adminUrl: 'http://localhost:3000/admin/orders/abc' };

test('onderwerp noemt testbestelling, nummer en bedrag', () => {
  const { subject } = orderMail(order, items, opts);
  assert.match(subject, /^\[TEST\] Nieuwe bestelling #1004 – €\s40,80/);
  assert.ok(!/[\r\n]/.test(subject), 'geen regeleindes in het onderwerp');
});

test('geen [TEST] bij een echte bestelling', () => {
  assert.ok(!orderMail(order, items, { ...opts, test: false }).subject.includes('[TEST]'));
});

test('klantgegevens worden ge-escaped in de html', () => {
  const { html, text } = orderMail(order, items, opts);
  assert.ok(!html.includes('<b>de Vries</b>'));
  assert.ok(html.includes('&lt;b&gt;de Vries&lt;/b&gt;'));
  assert.ok(text.includes('2 × Slickerborstel'));
});
