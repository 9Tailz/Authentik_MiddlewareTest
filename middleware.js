import { NextResponse } from 'next/server';

console.log('[middleware init] middleware file loaded');

const PUBLIC_FILE = /\.(.*)$/;
const AUTH_EXCLUDE_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/favicon.ico',
];

export function middleware(request) {
  console.log('[middleware] INVOKED on', request.nextUrl.pathname);
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token');
  console.log('[middleware] incoming', { pathname, search: request.nextUrl.search, authToken: !!authToken });

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname) ||
    AUTH_EXCLUDE_PATHS.some((path) => pathname.startsWith(path))
  ) {
    console.log('[middleware] public or excluded path, allow', pathname);
    return NextResponse.next();
  }

  if (!authToken) {
    const loginUrl = new URL('/api/auth/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    console.log('[middleware] no auth_token cookie, redirecting to', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  console.log('[middleware] auth_token found, continue to', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
