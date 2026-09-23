import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, adminToken } from './auth';

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!process.env.ADMIN_PASSWORD || token !== (await adminToken())) {
    throw new Error('Niet ingelogd');
  }
}
