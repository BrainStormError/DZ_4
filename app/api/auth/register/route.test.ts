import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRegistrationTicket } from '@/lib/registration-ticket';
import type { User } from '@/lib/types';

process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.REGISTRATION_TICKET_SECRET = 'registration-test-secret';

const cookieState = vi.hoisted(() => ({
  value: undefined as string | undefined,
  set: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) =>
      cookieState.value === undefined ? undefined : { name, value: cookieState.value },
    set: cookieState.set,
  }),
}));

const sessionState = vi.hoisted(() => ({
  email: 'new.person@example.com' as string | null,
}));

vi.mock('@/lib/session', () => ({
  getUnregisteredEmail: vi.fn(async () => sessionState.email),
}));

vi.mock('@/lib/log', () => ({ logEvent: vi.fn() }));

const repo = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  createEmployeeUser: vi.fn(),
  toPublicUser: (user: Record<string, unknown>) => {
    const { googleSub: _ignored, ...rest } = user;
    return rest;
  },
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

const validBody = {
  fullName: 'Новый Сотрудник',
  birthDate: '1990-01-01',
  department: 'Разработка',
};

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
    sessionState.email = 'new.person@example.com';
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
    const response = await POST(request(validBody));

    expect(response.status).toBe(201);
    expect(repo.createEmployeeUser).toHaveBeenCalledTimes(1);
    const payload = repo.createEmployeeUser.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.email).toBe('new.person@example.com');
    expect(payload.googleSub).toBe('google-sub-1');
    expect(payload).not.toHaveProperty('role');
    expect(createdUser.role).toBe('employee');

    const body = (await response.json()) as { user: Record<string, unknown> };
    expect(body.user).not.toHaveProperty('googleSub');
    expect(body.user.fullName).toBe('Новый Сотрудник');
  });

  it('without a registration ticket nothing is created', async () => {
    cookieState.value = undefined;

    const response = await POST(request(validBody));

    expect(response.status).toBe(401);
    expect(repo.createEmployeeUser).not.toHaveBeenCalled();
  });

  it('a ticket alone, without the matching unregistered session, creates nothing', async () => {
    sessionState.email = null;

    const response = await POST(request(validBody));

    expect(response.status).toBe(401);
    expect(repo.createEmployeeUser).not.toHaveBeenCalled();
  });

  it('a ticket whose address differs from the session address creates nothing', async () => {
    sessionState.email = 'someone.else@example.com';

    const response = await POST(request(validBody));

    expect(response.status).toBe(401);
    expect(repo.createEmployeeUser).not.toHaveBeenCalled();
  });

  it('a conflicting insert is treated as already registered, without an internal error', async () => {
    repo.createEmployeeUser.mockResolvedValueOnce(null);
    repo.findUserByEmail
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdUser);

    const response = await POST(request(validBody));

    expect(response.status).toBe(200);
    const body = (await response.json()) as { user: Record<string, unknown> | null };
    expect(body.user?.id).toBe('u100');
  });

  it('consumes the ticket on success', async () => {
    await POST(request(validBody));

    expect(cookieState.set).toHaveBeenCalledWith(
      expect.any(String),
      '',
      expect.objectContaining({ maxAge: 0 })
    );
  });
});
