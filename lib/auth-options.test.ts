// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { User } from './types';

process.env.NEXTAUTH_SECRET = 'session-test-secret';
process.env.REGISTRATION_TICKET_SECRET = 'registration-test-secret';

const cookieState = vi.hoisted(() => ({ set: vi.fn() }));

vi.mock('next/headers', () => ({
  cookies: () => ({ get: vi.fn(), set: cookieState.set }),
}));

const repo = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  findUserByGoogleSub: vi.fn(),
  bindUserGoogleSub: vi.fn(),
}));

vi.mock('./repository', () => repo);

const log = vi.hoisted(() => ({ logEvent: vi.fn() }));
vi.mock('./log', () => log);

import { authOptions, SESSION_MAX_AGE_SECONDS } from './auth-options';

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    fullName: 'Анна Смирнова',
    email: 'anna@example.com',
    googleSub: 'subject-1',
    birthDate: '1990-09-13',
    department: 'Маркетинг',
    avatarUrl: '',
    role: 'employee',
    ...overrides,
  };
}

function signInInput(email = 'anna@example.com', sub = 'subject-1') {
  return {
    user: { email, name: 'Анна' },
    account: { provider: 'google' },
    profile: { email_verified: true, sub },
  } as never;
}

describe('authOptions session configuration', () => {
  it('configures the documented 12-hour lifetime', () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(12 * 60 * 60);
    expect(authOptions.session?.maxAge).toBe(SESSION_MAX_AGE_SECONDS);
  });
});

describe('authOptions.signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repo.findUserByGoogleSub.mockResolvedValue(null);
    repo.bindUserGoogleSub.mockResolvedValue(null);
  });

  it('accepts a known account and records the event', async () => {
    repo.findUserByEmail.mockResolvedValue(user());

    const result = await authOptions.callbacks!.signIn!(signInInput());

    expect(result).toBe(true);
    expect(log.logEvent).toHaveBeenCalledWith(
      'sign_in',
      'accepted',
      expect.objectContaining({ account: 'anna@example.com' })
    );
  });

  it('refuses a subject mismatch and records the refusal', async () => {
    repo.findUserByEmail.mockResolvedValue(user({ googleSub: 'stored-subject' }));

    const result = await authOptions.callbacks!.signIn!(
      signInInput('anna@example.com', 'other-subject')
    );

    expect(result).toBe(false);
    expect(log.logEvent).toHaveBeenCalledWith(
      'sign_in',
      'refused',
      expect.objectContaining({ reason: 'subject_mismatch' })
    );
    expect(cookieState.set).not.toHaveBeenCalled();
  });

  it('issues a registration ticket for an unknown confirmed address', async () => {
    repo.findUserByEmail.mockResolvedValue(null);
    repo.findUserByGoogleSub.mockResolvedValue(null);

    const result = await authOptions.callbacks!.signIn!(
      signInInput('new.person@example.com', 'new-subject')
    );

    expect(result).toBe(true);
    expect(cookieState.set).toHaveBeenCalledWith(
      'corp-gift-registration',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, secure: false })
    );
  });

  it('refuses an account whose address Google did not confirm', async () => {
    const result = await authOptions.callbacks!.signIn!({
      user: { email: 'anna@example.com' },
      account: { provider: 'google' },
      profile: { email_verified: false, sub: 'subject-1' },
    } as never);

    expect(result).toBe(false);
    expect(log.logEvent).toHaveBeenCalledWith(
      'sign_in',
      'refused',
      expect.objectContaining({ reason: 'unconfirmed' })
    );
  });
});

describe('authOptions demo provider', () => {
  // The raw provider entry keeps the configured options under `options`; core
  // merges them in before use, so the effective provider id is `demo`.
  const demoProvider = authOptions.providers.find(
    (p) => (p as unknown as { options?: { id?: string } }).options?.id === 'demo'
  ) as unknown as {
    options: {
      authorize: (
        credentials: Record<string, string> | undefined
      ) => Promise<{ email?: string; name?: string } | null>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_LOGIN = '1';
    repo.findUserByEmail.mockResolvedValue(
      user({ email: 'anna.smirnova@company.com' })
    );
  });

  afterEach(() => {
    delete process.env.DEMO_LOGIN;
  });

  it('returns the stored record for an accepted demo address', async () => {
    const result = await demoProvider.options.authorize({
      email: 'anna.smirnova@company.com',
    });

    expect(result).not.toBeNull();
    expect(result?.email).toBe('anna.smirnova@company.com');
    expect(result?.name).toBe('Анна Смирнова');
  });

  it('returns null while the demo setting is off', async () => {
    delete process.env.DEMO_LOGIN;

    expect(
      await demoProvider.options.authorize({ email: 'anna.smirnova@company.com' })
    ).toBeNull();
  });

  it('returns null for an address outside the allow-list', async () => {
    expect(
      await demoProvider.options.authorize({ email: 'other@company.com' })
    ).toBeNull();
    expect(repo.findUserByEmail).not.toHaveBeenCalled();
  });
});

describe('authOptions.signIn demo branch', () => {
  function demoSignInInput(email: string) {
    return {
      user: { email },
      account: { provider: 'demo' },
      profile: undefined,
    } as never;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.DEMO_LOGIN;
  });

  it('accepts an allow-listed address when enabled', async () => {
    process.env.DEMO_LOGIN = '1';

    const result = await authOptions.callbacks!.signIn!(
      demoSignInInput('anna.smirnova@company.com')
    );

    expect(result).toBe(true);
    expect(log.logEvent).toHaveBeenCalledWith(
      'sign_in',
      'accepted',
      expect.objectContaining({ demo: true })
    );
  });

  it('refuses an address outside the allow-list when enabled', async () => {
    process.env.DEMO_LOGIN = '1';

    const result = await authOptions.callbacks!.signIn!(
      demoSignInInput('other@company.com')
    );

    expect(result).toBe(false);
    expect(log.logEvent).toHaveBeenCalledWith(
      'sign_in',
      'refused',
      expect.objectContaining({ reason: 'demo_not_allowed' })
    );
  });

  it('refuses an allow-listed address when disabled', async () => {
    delete process.env.DEMO_LOGIN;

    const result = await authOptions.callbacks!.signIn!(
      demoSignInInput('anna.smirnova@company.com')
    );

    expect(result).toBe(false);
    expect(log.logEvent).toHaveBeenCalledWith(
      'sign_in',
      'refused',
      expect.objectContaining({ reason: 'demo_disabled' })
    );
  });
});

describe('authOptions.jwt demo resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['anna.smirnova@company.com', 'employee'],
    ['alexander.petrov@company.com', 'admin'],
  ])('resolves %s to the stored id and role', async (email, role) => {
    const id = `u-${email}`;
    repo.findUserByEmail.mockResolvedValue(
      user({ id, email, role: role as User['role'] })
    );

    const token = await authOptions.callbacks!.jwt!({
      token: {},
      user: { email },
      profile: undefined,
    } as never);

    expect(token.userId).toBe(id);
    expect(token.email).toBe(email);
  });

  it('marks an unknown demo-shaped address as unregistered', async () => {
    repo.findUserByEmail.mockResolvedValue(null);

    const token = await authOptions.callbacks!.jwt!({
      token: {},
      user: { email: 'ghost@company.com' },
      profile: undefined,
    } as never);

    expect(token.userId).toBeUndefined();
    expect(token.unregistered).toBe(true);
  });
});

describe('authOptions production cookie attributes', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('forces Secure and the __Secure- prefix in production', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');

    const production = await import('./auth-options');

    expect(production.authOptions.cookies?.sessionToken?.name).toBe(
      '__Secure-next-auth.session-token'
    );
    expect(production.authOptions.cookies?.sessionToken?.options?.secure).toBe(true);
    expect(production.authOptions.useSecureCookies).toBe(true);
  });
});
