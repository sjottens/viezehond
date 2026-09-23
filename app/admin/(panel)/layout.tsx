import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE } from '@/lib/auth';

async function logout() {
  'use server';
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <nav className="admin-nav">
        <strong>Viezehond beheer</strong>
        <Link href="/admin">Bestellingen</Link>
        <Link href="/admin/products">Producten</Link>
        <Link href="/" target="_blank">Winkel bekijken</Link>
        <form action={logout}><button className="link-btn">Uitloggen</button></form>
      </nav>
      {children}
    </div>
  );
}
