// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logEvent } from './log';

describe('logEvent', () => {
  const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    spy.mockClear();
  });

  it('redacts secret fields and neutralises request values', () => {
    logEvent('sign_in', 'refused', {
      account: 'anna@example.com',
      sessionToken: 'super-secret-value',
      registrationTicket: 'ticket-value',
      reason: 'bad\nvalue',
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const output = spy.mock.calls[0][0] as string;
    expect(output).not.toContain('super-secret-value');
    expect(output).not.toContain('ticket-value');

    const entry = JSON.parse(output) as Record<string, unknown>;
    expect(entry.event).toBe('sign_in');
    expect(entry.outcome).toBe('refused');
    expect(entry.sessionToken).toBe('[redacted]');
    expect(entry.registrationTicket).toBe('[redacted]');
    expect(entry.reason).toBe('bad value');
  });

  it('writes one entry even when a request value carries a line break', () => {
    logEvent('authorization', 'refused', {
      account: 'x\n{"event":"forged","outcome":"accepted"}',
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const output = spy.mock.calls[0][0] as string;
    expect(output.split('\n')).toHaveLength(1);

    const entry = JSON.parse(output) as Record<string, unknown>;
    expect(String(entry.account)).not.toMatch(/[\r\n]/);
  });
});
