import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Server-only database client. De service role key komt nooit in de browser.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt in .env');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  stock: number;
  category: string;
  image_url: string | null;
  active: boolean;
};

export type Order = {
  id: string;
  number: number;
  status: 'open' | 'paid' | 'shipped' | 'failed' | 'canceled' | 'expired';
  email: string;
  name: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  mollie_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
};
