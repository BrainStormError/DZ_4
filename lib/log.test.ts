// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { levelForOutcome, logEvent, logFailure } from './log';

const stdout = vi.spyOn(console, 'log').mockImplementation(() => {});
const stderrWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const stderrError = vi.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  stdout.mockClear();
  stderrWarn.mockClear();
  stderrError.mockClear();
});

describe('levelForOutcome', () => {
  it('maps each outcome to its expected level', () => {
    expect(levelForOutcome('accepted')).toBe('info');
    expect(levelForOutcome('created')).toBe('info');
    expect(levelForOutcome('success')).toBe('info');
    expect(levelForOutcome('refused')).toBe('warn');
    expect(levelForOutcome('already_registered')).toBe('warn');
    expect(levelForOutcome('failed')).toBe('error');
    expect(levelForOutcome('something_unexpected')).toBe('error');
  });
});

describe('logEvent', () => {
  it('writes the level as the first field of a single JSON line', () => {
    logEvent('sign_in', 'accepted', { account: 'anna@example.com' });

    expect(stdout).toHaveBeenCalledTimes(1);
    const output = stdout.mock.calls[0][0] as string;
    expect(output.split('\n')).toHaveLength(1);
    const entry = JSON.parse(output) as Record<string, unknown>;
    expect(entry).toMatchObject({
      level: 'info',
      event: 'sign_in',
      outcome: 'accepted',
    });
    expect(entry.at).toEqual(expect.any(String));
    expect(Object.keys(entry)[0]).toBe('level');
  });

  it('routes informational entries to standard output', () => {
    logEvent('sign_in', 'accepted', { account: 'anna@example.com' });

    expect(stdout).toHaveBeenCalledTimes(1);
    expect(stderrWarn).not.toHaveBeenCalled();
    expect(stderrError).not.toHaveBeenCalled();
  });

  it('routes warnings to the standard-error stream', () => {
    logEvent('sign_in', 'refused', { reason: 'bad' });

    expect(stderrWarn).toHaveBeenCalledTimes(1);
    expect(stderrWarn.mock.calls[0][0]).toContain('"level":"warn"');
    expect(stdout).not.toHaveBeenCalled();
  });

  it('routes errors to the standard-error stream', () => {
    logEvent('something', 'failed', { reason: 'boom' });

    expect(stderrError).toHaveBeenCalledTimes(1);
    expect(stderrError.mock.calls[0][0]).toContain('"level":"error"');
    expect(stdout).not.toHaveBeenCalled();
    expect(stderrWarn).not.toHaveBeenCalled();
  });

  it('redacts secret fields and neutralises request values', () => {
    logEvent('sign_in', 'refused', {
      account: 'anna@example.com',
      sessionToken: 'super-secret-value',
      registrationTicket: 'ticket-value',
      reason: 'bad\nvalue',
    });

    expect(stderrWarn).toHaveBeenCalledTimes(1);
    const output = stderrWarn.mock.calls[0][0] as string;
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

    expect(stderrWarn).toHaveBeenCalledTimes(1);
    const output = stderrWarn.mock.calls[0][0] as string;
    expect(output.split('\n')).toHaveLength(1);

    const entry = JSON.parse(output) as Record<string, unknown>;
    expect(String(entry.account)).not.toMatch(/[\r\n]/);
  });
});

describe('logFailure', () => {
  it('emits an error entry naming the failed operation', () => {
    logFailure('GET /api/users');

    expect(stderrError).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(stderrError.mock.calls[0][0] as string) as Record<
      string,
      unknown
    >;
    expect(entry.level).toBe('error');
    expect(entry.operation).toBe('GET /api/users');
  });

  it('never throws and exposes no secret', () => {
    expect(() =>
      logFailure('POST /api/wishes', { sessionToken: 'super-secret-value' })
    ).not.toThrow();

    const entry = JSON.parse(stderrError.mock.calls[0][0] as string) as Record<
      string,
      unknown
    >;
    expect(entry.sessionToken).toBe('[redacted]');
    expect(stderrError.mock.calls[0][0]).not.toContain('super-secret-value');
  });
});
