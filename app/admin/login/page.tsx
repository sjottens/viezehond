import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, adminToken } from '@/lib/auth';

async function login(formData: FormData) {
  'use server';
  const password = process.env.ADMIN_PASSWORD;
  if (password && formData.get('password') === password) {
    (await cookies()).set(ADMIN_COOKIE, await adminToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect('/admin');
  }
  redirect('/admin/login?fout=1');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ fout?: string }> }) {
  const { fout } = await searchParams;
  return (
    <section className="page narrow">
      <h1>Beheer</h1>
      <form action={login} className="form">
        <label>Wachtwoord<input name="password" type="password" required autoFocus /></label>
        {fout && <p className="error" role="alert">Dat wachtwoord klopt niet.</p>}
        <button className="btn">Inloggen</button>
      </form>
    </section>
  );
}
