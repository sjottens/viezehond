'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
};

type Cart = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const cart: Cart = {
    items,
    ready,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.priceCents * i.quantity, 0),
    add(item, quantity) {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId ? { ...i, quantity: Math.min(i.quantity + quantity, item.stock) } : i,
          );
        }
        return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
      });
    },
    setQuantity(productId, quantity) {
      setItems((prev) =>
        prev
          .map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i))
          .filter((i) => i.quantity > 0),
      );
    },
    remove(productId) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    },
    clear() {
      setItems([]);
    },
  };

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart moet binnen CartProvider');
  return ctx;
}
