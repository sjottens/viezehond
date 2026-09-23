import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from './lib/session';

// Snelle, optimistische check voor /admin. De echte controle zit in requireAdmin()
// in elke beheerpagina en server action; dit is alleen de voordeur.
export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin/login')) return NextResponse.next();
  if (!(await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
