import 'server-only';
import { headers } from 'next/headers';

// Eenvoudige limiet per IP-adres, in het geheugen van de server.
// Op Vercel heeft elke instantie zijn eigen teller: het remt misbruik af, maar is geen harde grens.
const hits = new Map<string, number[]>();

export async function clientIp() {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'onbekend';
}

/** Geeft false als deze sleutel te vaak is gebruikt binnen het tijdvenster. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.clear(); // noodrem tegen geheugengroei
  return true;
}
