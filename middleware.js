import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const AUTH_EXCLUDE_PATHS = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/favicon.ico',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname) ||
    AUTH_EXCLUDE_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token');
  if (!authToken) {
    const loginUrl = new URL('/api/auth/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
