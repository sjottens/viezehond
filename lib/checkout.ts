// Controle van wat de browser bij het afrekenen opstuurt. Geen imports: wordt ook los getest.
import type { Customer } from './types';

export type CheckoutBody = {
  items?: { productId?: unknown; quantity?: unknown }[];
  customer?: Record<string, unknown>;
};

export const MAX_PER_PRODUCT = 50;

const POSTCODE: Record<string, { re: RegExp; format: (m: RegExpMatchArray) => string }> = {
  NL: { re: /^([1-9][0-9]{3})\s?([A-Z]{2})$/, format: (m) => `${m[1]} ${m[2]}` },
  BE: { re: /^([1-9][0-9]{3})$/, format: (m) => m[1] },
};

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function validateCheckout(body: CheckoutBody):
  | { ok: true; customer: Customer; quantities: Map<string, number> }
  | { ok: false; error: string } {
  const c = body.customer ?? {};
  const country = text(c.country, 2) || 'NL';
  const customer: Customer = {
    name: text(c.name, 100),
    email: text(c.email, 200).toLowerCase(),
    street: text(c.street, 150),
    postal_code: text(c.postalCode, 10).toUpperCase(),
    city: text(c.city, 100),
    country,
    phone: text(c.phone, 30) || null,
  };

  if (!customer.name || !customer.street || !customer.postal_code || !customer.city) {
    return { ok: false, error: 'Vul je naam en volledige adres in.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) return { ok: false, error: 'Vul een geldig e-mailadres in.' };

  const postcode = POSTCODE[country];
  if (!postcode) return { ok: false, error: 'We verzenden alleen naar Nederland en België.' };
  const match = customer.postal_code.match(postcode.re);
  if (!match) return { ok: false, error: country === 'NL' ? 'Vul een geldige postcode in, zoals 1234 AB.' : 'Vul een geldige postcode in, zoals 2000.' };
  customer.postal_code = postcode.format(match);

  const quantities = new Map<string, number>();
  for (const i of body.items ?? []) {
    if (typeof i?.productId !== 'string' || !Number.isInteger(i.quantity) || (i.quantity as number) < 1) continue;
    const q = (quantities.get(i.productId) ?? 0) + (i.quantity as number);
    quantities.set(i.productId, Math.min(q, MAX_PER_PRODUCT));
  }
  if (quantities.size === 0) return { ok: false, error: 'Je winkelwagen is leeg.' };
  if (quantities.size > 50) return { ok: false, error: 'Je winkelwagen bevat te veel verschillende producten.' };

  return { ok: true, customer, quantities };
}
