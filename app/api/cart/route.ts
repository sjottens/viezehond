import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

// Actuele prijs en voorraad voor de producten in de winkelwagen (die staat in de browser en kan verouderd zijn).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown): x is string => typeof x === 'string').slice(0, 50) : [];
  const products = await store().getProductsByIds(ids);
  return NextResponse.json({
    products: products
      .filter((p) => p.active)
      .map((p) => ({ id: p.id, slug: p.slug, name: p.name, priceCents: p.price_cents, stock: p.stock, imageUrl: p.image_url, category: p.category })),
  });
}
