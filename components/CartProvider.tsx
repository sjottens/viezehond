'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  category?: string;
  stock: number;
  quantity: number;
};

type Cart = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);
const STORAGE_KEY = 'cart';

type Fresh = Omit<CartItem, 'quantity' | 'productId'> & { id: string };

// De winkelwagen staat in de browser en kan verouderd zijn: haal actuele prijs en voorraad op.
async function fetchFresh(items: CartItem[]): Promise<Fresh[] | null> {
  if (items.length === 0) return null;
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: items.map((i) => i.productId) }),
    });
    return res.ok ? ((await res.json()) as { products: Fresh[] }).products : null;
  } catch {
    return null;
  }
}

function applyFresh(items: CartItem[], checked: string[], fresh: Fresh[]) {
  return items.flatMap((i) => {
    if (!checked.includes(i.productId)) return [i]; // later toegevoegd, al actueel
    const match = fresh.find((x) => x.id === i.productId);
    if (!match || match.stock < 1) return []; // niet meer leverbaar
    const { slug, name, priceCents, imageUrl, category, stock } = match;
    return [{ ...i, slug, name, priceCents, imageUrl, category, stock, quantity: Math.min(i.quantity, stock) }];
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let saved: CartItem[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {}
    setItems(saved); // eslint-disable-line react-hooks/set-state-in-effect -- localStorage bestaat pas in de browser
    setReady(true);
    // Toepassen op de huidige inhoud: die kan intussen gewijzigd of geleegd zijn
    fetchFresh(saved).then((fresh) => fresh && setItems((current) => applyFresh(current, saved.map((i) => i.productId), fresh)));
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) => (i.productId === item.productId ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.stock) } : i));
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i)).filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const cart = useMemo<Cart>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.priceCents * i.quantity, 0),
      drawerOpen,
      setDrawerOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, ready, drawerOpen, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart moet binnen CartProvider');
  return ctx;
}
