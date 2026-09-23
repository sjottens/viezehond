import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCheckout } from '../lib/checkout.ts';

const customer = { name: 'Sanne', email: 'Sanne@Example.com ', street: 'Modderpad 12', postalCode: '3511ab', city: 'Utrecht', country: 'NL' };
const items = [{ productId: 'a', quantity: 2 }];

test('accepteert een geldige bestelling en normaliseert gegevens', () => {
  const r = validateCheckout({ customer, items });
  assert.ok(r.ok);
  assert.equal(r.customer.email, 'sanne@example.com');
  assert.equal(r.customer.postal_code, '3511 AB');
  assert.equal(r.customer.phone, null);
});

test('weigert een ongeldige Nederlandse postcode', () => {
  const r = validateCheckout({ customer: { ...customer, postalCode: '123' }, items });
  assert.equal(r.ok, false);
});

test('accepteert een Belgische postcode', () => {
  const r = validateCheckout({ customer: { ...customer, country: 'BE', postalCode: '2000' }, items });
  assert.ok(r.ok);
});

test('weigert landen buiten NL en BE', () => {
  assert.equal(validateCheckout({ customer: { ...customer, country: 'DE' }, items }).ok, false);
});

test('weigert een ongeldig e-mailadres', () => {
  assert.equal(validateCheckout({ customer: { ...customer, email: 'geen-mail' }, items }).ok, false);
});

test('voegt dubbele regels samen en begrenst het aantal', () => {
  const r = validateCheckout({ customer, items: [{ productId: 'a', quantity: 30 }, { productId: 'a', quantity: 30 }] });
  assert.ok(r.ok);
  assert.equal(r.quantities.get('a'), 50);
});

test('negeert rare aantallen en weigert een lege winkelwagen', () => {
  const r = validateCheckout({ customer, items: [{ productId: 'a', quantity: -1 }, { productId: 'b', quantity: 1.5 }, { productId: 5, quantity: 1 }] });
  assert.equal(r.ok, false);
});

test('een prijs uit de browser wordt genegeerd', () => {
  const r = validateCheckout({ customer, items: [{ productId: 'a', quantity: 1, price: 1 } as never] });
  assert.ok(r.ok);
  assert.deepEqual([...r.quantities], [['a', 1]]);
});
