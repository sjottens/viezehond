import 'server-only';

// Welke onderdelen draaien als demo? Lokaal: alles wat niet is ingevuld.
// In productie nooit stilletjes: dan moet DEMO_MODE=true expliciet aan staan.

const isProduction = () => process.env.NODE_ENV === 'production';
const demoAllowed = () => !isProduction() || process.env.DEMO_MODE === 'true';

export const isDemoData = () => !process.env.SUPABASE_URL;
export const isDemoPayments = () => !process.env.MOLLIE_API_KEY;

function assertDemoAllowed(missing: string) {
  if (!demoAllowed()) {
    throw new Error(`${missing} ontbreekt. Vul het in, of zet DEMO_MODE=true om bewust de demo te draaien.`);
  }
}

export function demoDataEnabled() {
  if (!isDemoData()) return false;
  assertDemoAllowed('SUPABASE_URL');
  return true;
}

export function demoPaymentsEnabled() {
  if (!isDemoPayments()) return false;
  assertDemoAllowed('MOLLIE_API_KEY');
  return true;
}

export function baseUrl() {
  const url = process.env.NEXT_PUBLIC_BASE_URL;
  if (url) return url.replace(/\/+$/, '');
  // Zonder adres kan Mollie geen webhook sturen en blijven bestellingen op "open" staan
  assertDemoAllowed('NEXT_PUBLIC_BASE_URL');
  // Vercel geeft het adres van de deploy mee; handig voor de online demo
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
