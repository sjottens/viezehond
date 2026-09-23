// Verzendkosten: pas hier aan
export const SHIPPING_CENTS = 495;
export const FREE_SHIPPING_FROM_CENTS = 5000;

export function shippingFor(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
}

const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
export function euro(cents: number) {
  return fmt.format(cents / 100);
}
