'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES } from '@/lib/catalog';
import { useCart } from './CartProvider';
import { BagIcon } from './icons';

function CategoryNav() {
  const pathname = usePathname();
  const current = useSearchParams().get('categorie');
  return (
    <nav className="main-nav" aria-label="Categorieën">
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/?categorie=${c.slug}#producten`}
          aria-current={pathname === '/' && current === c.slug ? 'page' : undefined}
          style={{ '--dot': c.color } as React.CSSProperties}
        >
          {c.short}
        </Link>
      ))}
    </nav>
  );
}

export function Header() {
  const { count, ready, setDrawerOpen } = useCart();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo" aria-label="Viezehond.nl, naar de homepage">
          viezehond<span className="tld">.nl</span>
        </Link>
        <Suspense fallback={<nav className="main-nav" />}>
          <CategoryNav />
        </Suspense>
        <button type="button" className="cart-btn" onClick={() => setDrawerOpen(true)} aria-label={`Winkelwagen, ${count} producten`}>
          <BagIcon />
          <span className="cart-label">Mandje</span>
          {ready && count > 0 && <span className="cart-count" key={count}>{count}</span>}
        </button>
      </div>
    </header>
  );
}
