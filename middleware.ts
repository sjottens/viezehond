import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, adminToken } from './lib/auth';

// Beschermt alles onder /admin, behalve de inlogpagina
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin/login')) return NextResponse.next();
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!process.env.ADMIN_PASSWORD || token !== (await adminToken())) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
