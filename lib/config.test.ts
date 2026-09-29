// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { requireSecret } from './config';

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
