export const CATEGORIES = [
  { slug: 'kammen', label: 'Kammen en borstels' },
  { slug: 'shampoo', label: 'Shampoo en verzorging' },
  { slug: 'handdoeken', label: 'Handdoeken' },
  { slug: 'accessoires', label: 'Accessoires' },
];

export function categoryLabel(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const STATUS_LABELS: Record<string, string> = {
  open: 'Wacht op betaling',
  paid: 'Betaald, nog verzenden',
  shipped: 'Verzonden',
  failed: 'Betaling mislukt',
  canceled: 'Geannuleerd',
  expired: 'Verlopen',
};
