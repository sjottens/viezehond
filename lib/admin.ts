import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, verifySessionToken } from './session';

// Aanroepen bovenaan elke beheerpagina en elke beheer-actie. Proxy is alleen de voordeur.
export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect('/admin/login');
}
