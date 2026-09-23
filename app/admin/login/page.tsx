import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { ADMIN_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken, usingDevPassword } from '@/lib/session';

async function login(formData: FormData) {
  'use server';
  // Maximaal 5 pogingen per kwartier per IP-adres
  if (!rateLimit(`login:${await clientIp()}`, 5, 15 * 60_000)) redirect('/admin/login?fout=wacht');

  const password = formData.get('password');
  if (typeof password !== 'string' || !(await checkPassword(password))) redirect('/admin/login?fout=1');

  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect('/admin');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ fout?: string }> }) {
  const { fout } = await searchParams;
  return (
    <section className="login">
      <div className="login-card">
        <p className="logo">viezehond<span className="tld">.nl</span></p>
        <h1>Beheer</h1>
        <form action={login} className="form">
          <label>
            Wachtwoord
            <input name="password" type="password" required autoFocus autoComplete="current-password" />
          </label>
          {fout === '1' && <p className="error" role="alert">Dat wachtwoord klopt niet.</p>}
          {fout === 'wacht' && <p className="error" role="alert">Te veel pogingen. Probeer het over een kwartier opnieuw.</p>}
          <button className="btn">Inloggen</button>
          {usingDevPassword() && <p className="muted">Lokale demo: het wachtwoord is <code>demo</code>.</p>}
        </form>
      </div>
    </section>
  );
}
