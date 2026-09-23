import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isDemoData, isDemoPayments } from '@/lib/env';
import { ADMIN_COOKIE } from '@/lib/session';

async function logout() {
  'use server';
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const demo = isDemoData() || isDemoPayments();
  return (
    <div className="admin">
      <nav className="admin-nav">
        <strong className="logo">viezehond<span className="tld">.nl</span> <span className="admin-tag">beheer</span></strong>
        <Link href="/admin">Bestellingen</Link>
        <Link href="/admin/products">Producten</Link>
        <Link href="/" target="_blank">Winkel bekijken</Link>
        <form action={logout}><button className="link-btn">Uitloggen</button></form>
      </nav>
      {demo && (
        <p className="admin-demo">
          Demo: {isDemoData() ? 'nepdata uit .data/db.json' : 'echte database'}, {isDemoPayments() ? 'nep-betalingen' : 'Mollie'}.
        </p>
      )}
      {children}
    </div>
  );
}
