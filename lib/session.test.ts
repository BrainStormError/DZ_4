// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encode, decode, getToken } from 'next-auth/jwt';
import type { User } from './types';

process.env.NEXTAUTH_SECRET = 'test-secret';

const sessionState = vi.hoisted(() => ({
  session: null as { userId?: string; unregistered?: boolean } | null,
}));

const cookieState = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(async () => sessionState.session),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) =>
      cookieState.value === undefined ? undefined : { name, value: cookieState.value },
  }),
}));

const repo = vi.hoisted(() => ({ findUserById: vi.fn() }));
vi.mock('./repository', () => repo);

import { resolveCurrentUser } from './session';

const storedUser: User = {
  id: 'u1',
  fullName: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  googleSub: null,
  birthDate: '1990-09-13',
  department: 'Маркетинг',
  avatarUrl: '',
  role: 'employee',
};

describe('resolveCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionState.session = null;
    cookieState.value = undefined;
    repo.findUserById.mockResolvedValue(storedUser);
  });

  it('loads the stored record by the id in the session', async () => {
    sessionState.session = { userId: 'u1' };

    const user = await resolveCurrentUser();

    expect(repo.findUserById).toHaveBeenCalledWith('u1');
    expect(user).toBe(storedUser);
  });

  it('rejects a request with no session', async () => {
    const user = await resolveCurrentUser();

    expect(user).toBeNull();
    expect(repo.findUserById).not.toHaveBeenCalled();
  });

  it('the old client-written cookie does not authenticate', async () => {
    // The legacy cookie carried a bare address; nothing reads it any more.
    cookieState.value = 'alexander.petrov@example.com';
    sessionState.session = null;

    const user = await resolveCurrentUser();

    expect(user).toBeNull();
    expect(repo.findUserById).not.toHaveBeenCalled();
  });
});

describe('session token integrity', () => {
  it('rejects a modified or unsigned session value', async () => {
    const secret = process.env.NEXTAUTH_SECRET as string;
    const token = await encode({ token: { userId: 'u1' }, secret });

    expect(await decode({ token, secret })).not.toBeNull();

    const tampered = `${token.slice(0, -2)}xx`;
    await expect(decode({ token: tampered, secret })).rejects.toThrow();
    await expect(decode({ token: 'not-a-signed-token', secret })).rejects.toThrow();

    // The cookie-reading path the application uses treats it as unauthenticated.
    const unauthenticated = await getToken({
      req: {
        headers: { cookie: `next-auth.session-token=${tampered}` },
      } as never,
      secret,
    });
    expect(unauthenticated).toBeNull();
  });
});
