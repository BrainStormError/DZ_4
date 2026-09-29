import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@/lib/types';

const sessionState = vi.hoisted(() => ({ user: null as unknown }));

vi.mock('@/lib/session', () => ({
  resolveCurrentUser: vi.fn(async () => sessionState.user),
}));

vi.mock('@/lib/log', () => ({ logEvent: vi.fn() }));

const repo = vi.hoisted(() => ({
  addChatMessage: vi.fn(),
  findUserByEmail: vi.fn(),
}));

vi.mock('@/lib/repository', () => repo);

import { POST } from './route';

const employee: User = {
  id: 'u2',
  fullName: 'Дмитрий Волков',
  email: 'dmitry@example.com',
  googleSub: null,
  birthDate: '1988-09-14',
  department: 'Разработка',
  avatarUrl: '',
  role: 'employee',
};

function request(body: unknown): Request {
  return new Request('http://localhost/api/chats/x/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function context(userEmail: string) {
  return { params: { userEmail } };
}

describe('POST /api/chats/[userEmail]/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionState.user = employee;
    repo.findUserByEmail.mockResolvedValue(employee);
    repo.addChatMessage.mockResolvedValue({
      id: 'c1',
      authorEmail: employee.email,
      text: 'hi',
      isAdmin: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('answers a malformed thread identifier with a client error and stores nothing', async () => {
    const response = await POST(request({ text: 'hi' }), context('%E0%A4%A'));

    expect(response.status).toBe(400);
    expect(repo.addChatMessage).not.toHaveBeenCalled();
  });

  it('still refuses a thread that is not the caller’s own', async () => {
    const response = await POST(
      request({ text: 'hi' }),
      context('someone.else@example.com')
    );

    expect(response.status).toBe(403);
    expect(repo.addChatMessage).not.toHaveBeenCalled();
  });
});
