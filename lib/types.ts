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
  created_at: string;
};

export type ProductInput = Omit<Product, 'id' | 'created_at'>;

export type OrderStatus = 'open' | 'paid' | 'shipped' | 'failed' | 'canceled' | 'expired' | 'refunded';

export type Customer = {
  name: string;
  email: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string | null;
};

export type Order = Customer & {
  id: string;
  number: number;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  mollie_payment_id: string | null;
  stock_deducted: boolean;
  /** Er was te weinig voorraad toen de betaling binnenkwam (twee klanten kochten tegelijk het laatste stuk). */
  stock_issue: boolean;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
};

export type OrderLine = {
  product_id: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
};

export type OrderItem = OrderLine & { id: string; order_id: string };

export type NewOrder = Customer & { subtotal_cents: number; shipping_cents: number; total_cents: number };
