import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from '@/lib/auth';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // [Admin Protection]
  // Check if path starts with /admin (excluding /api/admin which is handled by route logic usually, but good to protect here too if needed)
  // Note: We usually protect pages here. API protection is often done in the route handler for finer control, 
  // but blocking /admin pages is essential.
  if (pathname.includes('/admin')) {
    if (!isLoggedIn || userRole !== 'ADMIN') {
      // Redirect unauthorized users to Home
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // [i18n] Continue with internationalization middleware
  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
