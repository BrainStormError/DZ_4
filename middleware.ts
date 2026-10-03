import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Produces a per-request nonce for the Content-Security-Policy. The nonce is
 * passed to the application through the `x-nonce` request header so the inline
 * theme bootstrap can carry it, and the policy prevents the application from
 * being framed.
 */
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://mc.yandex.ru https://yastatic.net https://yandex.ru wss://mc.yandex.ru",
    "frame-src https://mc.yandex.ru",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
