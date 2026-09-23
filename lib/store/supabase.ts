import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderItem, Product } from '../types';
import { SlugTakenError } from './errors';
import type { Store } from './index';

const BUCKET = 'product-images';

function client(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt in .env');
  // Service role key: alleen op de server, nooit in de browser
  return createClient(url, key, { auth: { persistSession: false } });
}

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data;
}

export function supabaseStore(): Store {
  const db = client();

  return {
    async listProducts({ category, includeInactive } = {}) {
      let q = db.from('products').select('*');
      if (!includeInactive) q = q.eq('active', true);
      if (category) q = q.eq('category', category);
      q = includeInactive ? q.order('created_at', { ascending: false }) : q.order('created_at');
      return check(await q) as Product[];
    },
    async getProduct(id) {
      return check(await db.from('products').select('*').eq('id', id).maybeSingle<Product>());
    },
    async getActiveProductBySlug(slug) {
      return check(await db.from('products').select('*').eq('slug', slug).eq('active', true).maybeSingle<Product>());
    },
    async getProductsByIds(ids) {
      if (ids.length === 0) return [];
      return check(await db.from('products').select('*').in('id', ids)) as Product[];
    },
    async saveProduct(id, input) {
      const { error } = id ? await db.from('products').update(input).eq('id', id) : await db.from('products').insert(input);
      if (error?.code === '23505') throw new SlugTakenError();
      if (error) throw new Error(error.message);
    },
    async uploadImage(file, name) {
      const { error } = await db.storage.from(BUCKET).upload(name, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      return db.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
    },

    async createOrder(order, lines) {
      const created = check(await db.from('orders').insert(order).select('id, number').single<{ id: string; number: number }>());
      if (!created) throw new Error('Bestelling niet aangemaakt');
      const { error } = await db.from('order_items').insert(lines.map((l) => ({ ...l, order_id: created.id })));
      if (error) {
        await db.from('orders').delete().eq('id', created.id);
        throw new Error(error.message);
      }
      return created;
    },
    async getOrder(id) {
      return check(await db.from('orders').select('*').eq('id', id).maybeSingle<Order>());
    },
    async getOrderItems(orderId) {
      return check(await db.from('order_items').select('*').eq('order_id', orderId)) as OrderItem[];
    },
    async listOrders(status) {
      let q = db.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
      if (status) q = q.eq('status', status);
      return check(await q) as Order[];
    },
    async setPaymentId(orderId, paymentId) {
      check(await db.from('orders').update({ mollie_payment_id: paymentId }).eq('id', orderId));
    },
    async updateOrderStatus(orderId, to, from) {
      const patch = to === 'shipped' ? { status: to, shipped_at: new Date().toISOString() } : { status: to };
      check(await db.from('orders').update(patch).eq('id', orderId).in('status', from));
    },
    async markOrderPaid(orderId) {
      check(await db.rpc('mark_order_paid', { p_order_id: orderId }));
    },
  };
}
