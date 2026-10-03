// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const poolQuery = vi.hoisted(() => vi.fn());

vi.mock('pg', () => ({
  Pool: vi.fn(function PoolMock() {
    return { query: poolQuery };
  }),
}));

import { pingDatabase } from './db';

describe('pingDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test';
  });

  it('resolves when the pool query succeeds', async () => {
    poolQuery.mockResolvedValueOnce({ rows: [] });

    await expect(pingDatabase()).resolves.toBeUndefined();
    expect(poolQuery).toHaveBeenCalledWith('SELECT 1', []);
  });

  it('rejects when the pool query fails', async () => {
    poolQuery.mockRejectedValueOnce(new Error('database unavailable'));

    await expect(pingDatabase()).rejects.toThrow('database unavailable');
  });
});
