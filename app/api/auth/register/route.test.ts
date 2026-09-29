import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRegistrationTicket } from '@/lib/registration-ticket';
import type { User } from '@/lib/types';

process.env.NEXTAUTH_SECRET = 'test-secret';

const cookieState = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) =>
      cookieState.value === undefined ? undefined : { name, value: cookieState.value },
    set: vi.fn(),
  }),
}));

const repo = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  createEmployeeUser: vi.fn(),
}));

vi.mock('@/lib/repository', () => repo);

import { POST } from './route';

function request(body: unknown): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function ticket(email = 'new.person@example.com'): string {
  return createRegistrationTicket({
    email,
    fullName: 'Новый Сотрудник',
    googleSub: 'google-sub-1',
    avatarUrl: null,
  });
}

const createdUser: User = {
  id: 'u100',
  fullName: 'Новый Сотрудник',
  email: 'new.person@example.com',
  googleSub: 'google-sub-1',
  birthDate: '1990-01-01',
  department: 'Разработка',
  avatarUrl: '',
  role: 'employee',
};

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieState.value = ticket();
    repo.findUserByEmail.mockResolvedValue(null);
    repo.createEmployeeUser.mockResolvedValue(createdUser);
  });

  it('an incomplete profile creates no record and grants no access', async () => {
    const response = await POST(
      request({ fullName: '', birthDate: '', department: '' })
    );

    expect(response.status).toBe(400);
    expect(repo.createEmployeeUser).not.toHaveBeenCalled();
  });

  it('a completed profile creates an employee with the confirmed address', async () => {
    const response = await POST(
      request({
        fullName: 'Новый Сотрудник',
        birthDate: '1990-01-01',
        department: 'Разработка',
      })
    );

    expect(response.status).toBe(201);
    expect(repo.createEmployeeUser).toHaveBeenCalledTimes(1);
    const payload = repo.createEmployeeUser.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.email).toBe('new.person@example.com');
    expect(payload.googleSub).toBe('google-sub-1');
    expect(payload).not.toHaveProperty('role');
    expect(createdUser.role).toBe('employee');
  });

  it('without a registration ticket nothing is created', async () => {
    cookieState.value = undefined;

    const response = await POST(
      request({
        fullName: 'Новый Сотрудник',
        birthDate: '1990-01-01',
        department: 'Разработка',
      })
    );

    expect(response.status).toBe(401);
    expect(repo.createEmployeeUser).not.toHaveBeenCalled();
  });
});
