'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { euro } from '@/lib/money';
import { useCart } from './CartProvider';
import { FreeShippingBar } from './FreeShippingBar';
import { ProductImage } from './ProductImage';
import { Stepper } from './Stepper';
import { ArrowIcon, CloseIcon } from './icons';

// Schuift open als je iets toevoegt. <dialog> regelt focus en Escape voor ons.
export function CartDrawer() {
  const { items, subtotal, count, drawerOpen, setDrawerOpen, setQuantity, remove } = useCart();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  const close = () => setDrawerOpen(false);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="drawer-title"
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="drawer-inner">
        <header className="drawer-head">
          <h2 id="drawer-title">Winkelwagen <span className="count-pill">{count}</span></h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Sluiten"><CloseIcon /></button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Nog niks in je mandje. Tijd om je hond te verwennen.</p>
            <button type="button" className="btn" onClick={close}>Verder winkelen</button>
          </div>
        ) : (
          <>
            <FreeShippingBar subtotal={subtotal} />
            <ul className="drawer-list">
              {items.map((i) => (
                <li key={i.productId}>
                  <ProductImage src={i.imageUrl} name={i.name} slug={i.slug} category={i.category} className="thumb" />
                  <div className="drawer-item">
                    <Link href={`/product/${i.slug}`} onClick={close} className="drawer-name">{i.name}</Link>
                    <span className="muted">{euro(i.priceCents)}</span>
                    <div className="drawer-row">
                      <Stepper value={i.quantity} max={i.stock} onChange={(n) => setQuantity(i.productId, n)} label={i.name} />
                      <button type="button" className="link-btn small" onClick={() => remove(i.productId)}>Verwijder</button>
                    </div>
                  </div>
                  <strong className="drawer-price">{euro(i.priceCents * i.quantity)}</strong>
                </li>
              ))}
            </ul>
            <footer className="drawer-foot">
              <p className="drawer-total"><span>Subtotaal</span><strong>{euro(subtotal)}</strong></p>
              <Link href="/afrekenen" className="btn btn-big btn-block" onClick={close}>
                Afrekenen <ArrowIcon />
              </Link>
              <Link href="/winkelwagen" className="link-btn center" onClick={close}>Bekijk winkelwagen</Link>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
