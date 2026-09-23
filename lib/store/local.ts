import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Order, OrderItem, Product } from '../types';
import { SlugTakenError } from './errors';
import type { Store } from './index';
import { DATA_DIR, readJson, updateJson } from './json-file';
import { seedData } from './seed';

// Lokale demo-database: .data/db.json. Wordt bij de eerste keer gevuld met nepdata.
type Db = { products: Product[]; orders: Order[]; order_items: OrderItem[]; nextOrderNumber: number };

const FILE = 'db.json';
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

const read = () => readJson<Db>(FILE, seedData);
const change = <R>(fn: (db: Db) => R) => updateJson<Db, R>(FILE, seedData, fn);
const newest = (a: { created_at: string }, b: { created_at: string }) => b.created_at.localeCompare(a.created_at);

export const localStore: Store = {
  async listProducts({ category, includeInactive } = {}) {
    const { products } = await read();
    const list = products.filter((p) => (includeInactive || p.active) && (!category || p.category === category));
    return includeInactive ? list.sort(newest) : list.sort((a, b) => -newest(a, b));
  },
  async getProduct(id) {
    return (await read()).products.find((p) => p.id === id) ?? null;
  },
  async getActiveProductBySlug(slug) {
    return (await read()).products.find((p) => p.slug === slug && p.active) ?? null;
  },
  async getProductsByIds(ids) {
    return (await read()).products.filter((p) => ids.includes(p.id));
  },
  async saveProduct(id, input) {
    await change((db) => {
      if (db.products.some((p) => p.slug === input.slug && p.id !== id)) throw new SlugTakenError();
      if (id) {
        const p = db.products.find((x) => x.id === id);
        if (!p) throw new Error('Product niet gevonden');
        Object.assign(p, input);
      } else {
        db.products.push({ ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() });
      }
    });
  },
  async uploadImage(file, name) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    return `/demo-uploads/${name}`;
  },

  async createOrder(order, lines) {
    return change((db) => {
      const created: Order = {
        ...order,
        id: crypto.randomUUID(),
        number: db.nextOrderNumber++,
        status: 'open',
        mollie_payment_id: null,
        stock_deducted: false,
        stock_issue: false,
        created_at: new Date().toISOString(),
        paid_at: null,
        shipped_at: null,
      };
      db.orders.push(created);
      db.order_items.push(...lines.map((l) => ({ ...l, id: crypto.randomUUID(), order_id: created.id })));
      return { id: created.id, number: created.number };
    });
  },
  async getOrder(id) {
    return (await read()).orders.find((o) => o.id === id) ?? null;
  },
  async getOrderItems(orderId) {
    return (await read()).order_items.filter((i) => i.order_id === orderId);
  },
  async listOrders(status) {
    const { orders } = await read();
    return orders.filter((o) => !status || o.status === status).sort(newest).slice(0, 200);
  },
  async setPaymentId(orderId, paymentId) {
    await change((db) => {
      const o = db.orders.find((x) => x.id === orderId);
      if (o) o.mollie_payment_id = paymentId;
    });
  },
  async updateOrderStatus(orderId, to, from) {
    await change((db) => {
      const o = db.orders.find((x) => x.id === orderId);
      if (!o || !from.includes(o.status)) return;
      o.status = to;
      if (to === 'shipped') o.shipped_at = new Date().toISOString();
    });
  },
  // Zelfde logica als mark_order_paid in supabase/schema.sql
  async markOrderPaid(orderId) {
    await change((db) => {
      const o = db.orders.find((x) => x.id === orderId);
      if (!o || o.stock_deducted) return;
      o.status = 'paid';
      o.paid_at = new Date().toISOString();
      o.stock_deducted = true;
      for (const item of db.order_items.filter((i) => i.order_id === orderId)) {
        const p = db.products.find((x) => x.id === item.product_id);
        if (!p) continue;
        if (p.stock < item.quantity) o.stock_issue = true;
        p.stock = Math.max(p.stock - item.quantity, 0);
      }
    });
  },
};
