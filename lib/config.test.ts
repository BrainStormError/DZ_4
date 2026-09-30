// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { requireSecret, isDemoLoginEnabled } from './config';

describe('requireSecret', () => {
  afterEach(() => {
    delete process.env.TEST_CONFIG_SECRET;
  });

  it('returns a configured secret', () => {
    process.env.TEST_CONFIG_SECRET = 'a-real-secret';
    expect(requireSecret('TEST_CONFIG_SECRET')).toBe('a-real-secret');
  });

  it('reports a missing secret instead of defaulting', () => {
    expect(() => requireSecret('TEST_CONFIG_SECRET')).toThrow(/not set/i);
  });

  it('refuses the example placeholder value', () => {
    process.env.TEST_CONFIG_SECRET = 'replace-with-a-long-random-secret';
    expect(() => requireSecret('TEST_CONFIG_SECRET')).toThrow(/placeholder/i);
  });
});

describe('isDemoLoginEnabled', () => {
  afterEach(() => {
    delete process.env.DEMO_LOGIN;
  });

  it('is enabled by the documented value 1', () => {
    process.env.DEMO_LOGIN = '1';
    expect(isDemoLoginEnabled()).toBe(true);
  });

  it('is disabled when unset', () => {
    delete process.env.DEMO_LOGIN;
    expect(isDemoLoginEnabled()).toBe(false);
  });

  it('is disabled by any other value', () => {
    process.env.DEMO_LOGIN = '0';
    expect(isDemoLoginEnabled()).toBe(false);
    process.env.DEMO_LOGIN = 'true';
    expect(isDemoLoginEnabled()).toBe(false);
    process.env.DEMO_LOGIN = 'yes';
    expect(isDemoLoginEnabled()).toBe(false);
  });
});
