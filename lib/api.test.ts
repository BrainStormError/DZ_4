// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { isTrustedOrigin } from './api';

function request(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/donations', { method: 'POST', headers });
}

describe('isTrustedOrigin', () => {
  afterEach(() => {
    delete process.env.NEXTAUTH_URL;
  });

  it('allows a request that carries no origin information', () => {
    expect(isTrustedOrigin(request())).toBe(true);
  });

  it('allows the application’s own origin', () => {
    expect(
      isTrustedOrigin(request({ origin: 'http://localhost', host: 'localhost' }))
    ).toBe(true);
  });

  it('refuses a foreign origin', () => {
    expect(
      isTrustedOrigin(
        request({ origin: 'https://evil.example.com', host: 'app.example.com' })
      )
    ).toBe(false);
  });

  it('refuses a browser-marked cross-site request', () => {
    expect(
      isTrustedOrigin(
        request({
          'sec-fetch-site': 'cross-site',
          origin: 'http://localhost',
          host: 'localhost',
        })
      )
    ).toBe(false);
  });

  it('matches the configured public host', () => {
    process.env.NEXTAUTH_URL = 'https://app.example.com';
    expect(
      isTrustedOrigin(
        request({ origin: 'https://app.example.com', host: 'internal:3000' })
      )
    ).toBe(true);
    expect(
      isTrustedOrigin(
        request({ origin: 'https://other.example.com', host: 'internal:3000' })
      )
    ).toBe(false);
  });
});
