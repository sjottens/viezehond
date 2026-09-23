'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart, type CartItem } from './CartProvider';

export function AddToCart({ product }: { product: Omit<CartItem, 'quantity'> }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock < 1) return <p className="muted">Tijdelijk uitverkocht</p>;

  return (
    <div className="add-to-cart">
      <label className="qty">
        <span>Aantal</span>
        <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
          {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <button
        className="btn"
        onClick={() => {
          add(product, quantity);
          setAdded(true);
        }}
      >
        In winkelwagen
      </button>
      {added && (
        <p className="notice" role="status">
          Toegevoegd. <Link href="/winkelwagen">Bekijk je winkelwagen</Link>
        </p>
      )}
    </div>
  );
}
