import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const pingDatabase = vi.hoisted(() => vi.fn());
vi.mock('@/lib/db', () => ({ pingDatabase }));

const resolveCurrentUser = vi.hoisted(() => vi.fn());
vi.mock('@/lib/session', () => ({ resolveCurrentUser }));

import { GET } from './route';

const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const error = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('GET /api/health', () => {
  beforeEach(() => {
    pingDatabase.mockReset();
    resolveCurrentUser.mockReset();
    warn.mockClear();
    error.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('answers 200 ok when the database check succeeds', async () => {
    pingDatabase.mockResolvedValueOnce(undefined);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('answers 503 without connection details when the check fails', async () => {
    pingDatabase.mockRejectedValueOnce(
      new Error('connection refused to postgres://secret')
    );

    const response = await GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({ status: 'unavailable' });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('connection refused');
  });

  it('emits exactly one warn entry naming the readiness check', async () => {
    pingDatabase.mockRejectedValueOnce(new Error('database unavailable'));

    await GET();

    expect(warn).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(warn.mock.calls[0][0] as string) as Record<
      string,
      unknown
    >;
    expect(entry.level).toBe('warn');
    expect(entry.event).toBe('readiness_checked');
    expect(error).not.toHaveBeenCalled();
  });

  it('answers without a session and does not resolve a user', async () => {
    pingDatabase.mockResolvedValueOnce(undefined);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(resolveCurrentUser).not.toHaveBeenCalled();
  });

  it('re-runs the check per call instead of returning a cached result', async () => {
    pingDatabase
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('database unavailable'));

    expect((await GET()).status).toBe(200);
    expect((await GET()).status).toBe(503);
    expect(pingDatabase).toHaveBeenCalledTimes(2);
  });

  it('answers 503 when the check does not finish in time', async () => {
    pingDatabase.mockReturnValue(new Promise(() => {}));
    vi.useFakeTimers();

    const pending = GET();
    await vi.advanceTimersByTimeAsync(2000);
    const response = await pending;

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'unavailable' });
  });
});
