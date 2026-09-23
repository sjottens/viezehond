import 'server-only';
import { demoDataEnabled } from '../env';
import type { NewOrder, Order, OrderItem, OrderLine, OrderStatus, Product, ProductInput } from '../types';
import { localStore } from './local';
import { supabaseStore } from './supabase';

// Eén plek voor alle data. Supabase als het is ingesteld, anders de lokale demo-database.
export interface Store {
  listProducts(opts?: { category?: string; includeInactive?: boolean }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  getActiveProductBySlug(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  /** Gooit SlugTakenError als de slug al bestaat. */
  saveProduct(id: string | null, input: ProductInput): Promise<void>;
  uploadImage(file: File, name: string): Promise<string>;

  createOrder(order: NewOrder, lines: OrderLine[]): Promise<{ id: string; number: number }>;
  getOrder(id: string): Promise<Order | null>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  listOrders(status?: OrderStatus): Promise<Order[]>;
  setPaymentId(orderId: string, paymentId: string): Promise<void>;
  /** Wijzigt de status alleen als de huidige status in `from` staat. */
  updateOrderStatus(orderId: string, to: OrderStatus, from: OrderStatus[]): Promise<void>;
  /** Zet op betaald en boekt de voorraad af. Veilig om vaker aan te roepen. */
  markOrderPaid(orderId: string): Promise<void>;
}

export { SlugTakenError } from './errors';

export function store(): Store {
  return demoDataEnabled() ? localStore : supabaseStore();
}
