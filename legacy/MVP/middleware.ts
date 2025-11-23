import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Admin Security Check
  if (pathname.includes('/admin')) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    // Check if user is logged in
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/'; // Redirect to home/login
      return NextResponse.redirect(url);
    }

    // Check if user is ADMIN
    // @ts-ignore
    if (token.role !== 'ADMIN') {
        const url = req.nextUrl.clone();
        url.pathname = '/'; // Redirect to home (unauthorized)
        return NextResponse.redirect(url);
    }
  }

  // 2. Internationalization Middleware
  return intlMiddleware(req);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
