import { describe, it, expect } from 'vitest';
import { DEMO_ACCOUNTS, isDemoAccount } from './demo-accounts';

describe('DEMO_ACCOUNTS', () => {
  it('documents the two test addresses with a label each', () => {
    expect(DEMO_ACCOUNTS.map((account) => account.email)).toEqual([
      'anna.smirnova@company.com',
      'alexander.petrov@company.com',
    ]);
    expect(DEMO_ACCOUNTS.every((account) => account.label.length > 0)).toBe(true);
  });
});

describe('isDemoAccount', () => {
  it('accepts both documented addresses', () => {
    expect(isDemoAccount('anna.smirnova@company.com')).toBe(true);
    expect(isDemoAccount('alexander.petrov@company.com')).toBe(true);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(isDemoAccount(' Anna.Smirnova@Company.com ')).toBe(true);
    expect(isDemoAccount('\tALEXANDER.PETROV@COMPANY.COM\n')).toBe(true);
  });

  it('refuses any other address', () => {
    expect(isDemoAccount('someone.else@company.com')).toBe(false);
    expect(isDemoAccount('anna.smirnova@other.com')).toBe(false);
    expect(isDemoAccount('anna.smirnova')).toBe(false);
    expect(isDemoAccount('')).toBe(false);
    expect(isDemoAccount(undefined)).toBe(false);
    expect(isDemoAccount(null)).toBe(false);
  });
});
