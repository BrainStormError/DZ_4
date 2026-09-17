export const AUTH_COOKIE_NAME = 'corp-gift-auth-email';

export function writeAuthCookie(email: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=${email}; Path=/; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0`;
}
