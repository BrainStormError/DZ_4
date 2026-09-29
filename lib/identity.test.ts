// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from './types';

const repo = vi.hoisted(() => ({
  findUserByEmail: vi.fn(),
  findUserByGoogleSub: vi.fn(),
  bindUserGoogleSub: vi.fn(),
}));

vi.mock('./repository', () => repo);

import { resolveSignInUser } from './identity';

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    fullName: 'Анна Смирнова',
    email: 'anna@example.com',
    googleSub: null,
    birthDate: '1990-09-13',
    department: 'Маркетинг',
    avatarUrl: '',
    role: 'employee',
    ...overrides,
  };
}

describe('resolveSignInUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repo.findUserByGoogleSub.mockResolvedValue(null);
    repo.bindUserGoogleSub.mockResolvedValue(null);
  });

  it('refuses a sign-in whose stored record carries a different subject', async () => {
    repo.findUserByEmail.mockResolvedValue(user({ googleSub: 'stored-subject' }));

    const resolution = await resolveSignInUser('anna@example.com', 'other-subject');

    expect(resolution).toEqual({ status: 'subject_mismatch' });
    expect(repo.bindUserGoogleSub).not.toHaveBeenCalled();
  });

  it('binds the subject on a record that has none', async () => {
    const stored = user({ googleSub: null });
    repo.findUserByEmail.mockResolvedValue(stored);
    repo.bindUserGoogleSub.mockResolvedValue({ ...stored, googleSub: 'first-subject' });

    const resolution = await resolveSignInUser('anna@example.com', 'first-subject');

    expect(repo.bindUserGoogleSub).toHaveBeenCalledWith('u1', 'first-subject');
    expect(resolution).toMatchObject({
      status: 'known',
      user: { id: 'u1', googleSub: 'first-subject' },
    });
  });

  it('resolves a changed address by subject instead of creating a second profile', async () => {
    repo.findUserByEmail.mockResolvedValue(null);
    repo.findUserByGoogleSub.mockResolvedValue(
      user({ id: 'u1', email: 'old.address@example.com', googleSub: 'known-subject' })
    );

    const resolution = await resolveSignInUser('new.address@example.com', 'known-subject');

    expect(resolution).toMatchObject({
      status: 'known',
      user: { id: 'u1', email: 'old.address@example.com' },
    });
  });

  it('reports an unknown address', async () => {
    repo.findUserByEmail.mockResolvedValue(null);

    const resolution = await resolveSignInUser('unknown@example.com', 'subject');

    expect(resolution).toEqual({ status: 'unknown' });
  });
});
