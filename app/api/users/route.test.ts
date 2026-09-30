import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@/lib/types';

const sessionState = vi.hoisted(() => ({ user: null as unknown }));

vi.mock('@/lib/session', () => ({
  resolveCurrentUser: vi.fn(async () => sessionState.user),
}));

const repo = vi.hoisted(() => ({ listUsers: vi.fn() }));

vi.mock('@/lib/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/repository')>();
  return { ...actual, listUsers: repo.listUsers };
});

import { GET } from './route';

const stored: User = {
  id: 'u1',
  fullName: 'Анна Смирнова',
  email: 'anna@example.com',
  googleSub: 'google-subject-1',
  birthDate: '1990-09-13',
  department: 'Маркетинг',
  avatarUrl: 'https://example.com/a.png',
  role: 'employee',
};

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionState.user = { id: 'u9', role: 'employee', email: 'viewer@example.com' };
    repo.listUsers.mockResolvedValue([stored]);
  });

  it('omits the provider subject identifier', async () => {
    const response = await GET();

    const body = (await response.json()) as Record<string, unknown>[];
    expect(body[0]).not.toHaveProperty('googleSub');
  });

  it('keeps the displayed fields', async () => {
    const response = await GET();

    const [entry] = (await response.json()) as Record<string, unknown>[];
    expect(entry).toMatchObject({
      id: 'u1',
      fullName: 'Анна Смирнова',
      email: 'anna@example.com',
      department: 'Маркетинг',
      birthDate: '1990-09-13',
      avatarUrl: 'https://example.com/a.png',
      role: 'employee',
    });
  });

  it('requires a session', async () => {
    sessionState.user = null;

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('records an unexpected failure and still answers the defined response', async () => {
    repo.listUsers.mockRejectedValueOnce(new Error('database unavailable'));
    const onError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET();

    expect(response.status).toBe(500);
    const entry = JSON.parse(onError.mock.calls[0][0] as string) as Record<
      string,
      unknown
    >;
    expect(entry.level).toBe('error');
    expect(entry.operation).toBe('GET /api/users');
    onError.mockRestore();
  });
});
