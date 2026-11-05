import type { OrderStatus, Product } from './types';

// De categorieën die nu in de winkel staan
export const CATEGORIES = [
  { slug: 'shampoo', label: 'Shampoo', short: 'Shampoo', color: 'var(--c-shampoo)' },
  { slug: 'conditioner', label: 'Conditioner', short: 'Conditioner', color: 'var(--c-conditioner)' },
  { slug: 'droogshampoo', label: 'Droogshampoo', short: 'Droogshampoo', color: 'var(--c-droogshampoo)' },
  { slug: 'handdoeken', label: 'Handdoeken', short: 'Handdoeken', color: 'var(--c-handdoeken)' },
  { slug: 'bundels', label: 'Voordeelbundels', short: 'Bundels', color: 'var(--c-bundels)' },
];

// Tijdelijk uit de winkel. Producten blijven in de admin staan; zet een categorie terug in CATEGORIES om ze weer te verkopen.
export const PAUSED_CATEGORIES = [
  { slug: 'kammen', label: 'Kammen en borstels' },
  { slug: 'accessoires', label: 'Accessoires' },
];

export function category(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string) {
  const paused = PAUSED_CATEGORIES.find((c) => c.slug === slug);
  return category(slug)?.label ?? (paused ? `${paused.label} (niet in de winkel)` : slug);
}

/** Zichtbaar en in een categorie die we nu verkopen. */
export function isForSale(p: Pick<Product, 'active' | 'category'>) {
  return p.active && !!category(p.category);
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
