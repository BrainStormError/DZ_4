// @vitest-environment node
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  registrationCookieAttributes,
  registrationCookieName,
  secureCookiesEnabled,
} from './cookies';

describe('cookie transport attributes', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('forces Secure and the __Secure- prefix in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(secureCookiesEnabled()).toBe(true);
    expect(registrationCookieName()).toBe('__Secure-corp-gift-registration');

    const attributes = registrationCookieAttributes(600);
    expect(attributes.secure).toBe(true);
    expect(attributes.httpOnly).toBe(true);
    expect(attributes.sameSite).toBe('lax');
    expect(attributes.maxAge).toBe(600);
  });

  it('does not force Secure outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(secureCookiesEnabled()).toBe(false);
    expect(registrationCookieName()).toBe('corp-gift-registration');
    expect(registrationCookieAttributes(600).secure).toBe(false);
  });
});
