import type { OrderStatus } from './types';

export const CATEGORIES = [
  { slug: 'kammen', label: 'Kammen en borstels', short: 'Kammen', color: 'var(--c-kammen)' },
  { slug: 'shampoo', label: 'Shampoo en verzorging', short: 'Shampoo', color: 'var(--c-shampoo)' },
  { slug: 'handdoeken', label: 'Handdoeken', short: 'Handdoeken', color: 'var(--c-handdoeken)' },
  { slug: 'accessoires', label: 'Accessoires', short: 'Accessoires', color: 'var(--c-accessoires)' },
];

export function category(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string) {
  return category(slug)?.label ?? slug;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  open: 'Wacht op betaling',
  paid: 'Betaald, nog verzenden',
  shipped: 'Verzonden',
  failed: 'Betaling mislukt',
  canceled: 'Geannuleerd',
  expired: 'Verlopen',
  refunded: 'Terugbetaald',
};

export const ORDER_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];
