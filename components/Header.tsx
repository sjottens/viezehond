'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';

export function Header() {
  const { count, ready } = useCart();
  if (usePathname().startsWith('/admin')) return null;
  return (
    <header className="site-header">
      <Link href="/" className="logo">viezehond<span className="tld">.nl</span></Link>
      <Link href="/winkelwagen" className="cart-link">
        Winkelwagen{ready && count > 0 ? <span className="cart-count">{count}</span> : null}
      </Link>
    </header>
  );
}
