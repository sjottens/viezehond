'use client';
import { useState } from 'react';
import { useCart, type CartItem } from './CartProvider';
import { Stepper } from './Stepper';
import { BagIcon, PlusIcon } from './icons';

type Item = Omit<CartItem, 'quantity'>;

export function AddToCart({ product }: { product: Item }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (product.stock < 1) return <p className="soldout-note">Tijdelijk uitverkocht. Kom snel terug!</p>;

  return (
    <div className="add-to-cart">
      <Stepper value={quantity} min={1} max={Math.min(product.stock, 10)} onChange={setQuantity} label={product.name} />
      <button type="button" className="btn btn-big" onClick={() => add(product, quantity)}>
        <BagIcon /> In mijn mandje
      </button>
    </div>
  );
}

// Het plusje op een productkaart
export function QuickAdd({ product }: { product: Item }) {
  const { add } = useCart();
  if (product.stock < 1) return null;
  return (
    <button type="button" className="quick-add" onClick={() => add(product, 1)} aria-label={`${product.name} in mandje`}>
      <PlusIcon size={22} />
    </button>
  );
}
