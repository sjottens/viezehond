// Verzendkosten: pas hier aan
export const SHIPPING_CENTS = 495;
export const FREE_SHIPPING_FROM_CENTS = 5000;

export function shippingFor(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
}

// Prijzen zijn incl. btw; dit is het btw-deel dat erin zit (ook over verzending)
export const VAT_PERCENT = 21;
export function vatIncluded(cents: number) {
  return Math.round((cents * VAT_PERCENT) / (100 + VAT_PERCENT));
}

const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });
export function euro(cents: number) {
  return fmt.format(cents / 100);
}
