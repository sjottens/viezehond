import { test } from 'node:test';
import assert from 'node:assert/strict';
import { euro, FREE_SHIPPING_FROM_CENTS, SHIPPING_CENTS, shippingFor } from '../lib/money.ts';

test('verzendkosten tot de grens, daarna gratis', () => {
  assert.equal(shippingFor(FREE_SHIPPING_FROM_CENTS - 1), SHIPPING_CENTS);
  assert.equal(shippingFor(FREE_SHIPPING_FROM_CENTS), 0);
});

test('bedragen in euro', () => {
  assert.equal(euro(1295).replace(/\s/g, ' '), '€ 12,95');
});
