const REGISTRATION_COOKIE_BASE = 'corp-gift-registration';

export interface CookieAttributes {
  path: string;
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
}

/**
 * The transport attributes follow the served scheme, not the spelling of the
 * configured address: a production deployment is served over HTTPS, so its
 * cookies are forced `Secure` (see the deployment specification).
 */
export function secureCookiesEnabled(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function registrationCookieName(): string {
  return secureCookiesEnabled()
    ? `__Secure-${REGISTRATION_COOKIE_BASE}`
    : REGISTRATION_COOKIE_BASE;
}

export function registrationCookieAttributes(maxAge: number): CookieAttributes {
  return {
    path: '/',
    maxAge,
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookiesEnabled(),
  };
}
