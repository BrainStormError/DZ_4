// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

vi.mock('@/lib/session', () => ({
  resolveCurrentUser: vi.fn(),
  hasUnregisteredSession: vi.fn(),
}));

vi.mock('@/lib/config', () => ({ isDemoLoginEnabled: vi.fn() }));

import { redirect } from 'next/navigation';
import { resolveCurrentUser, hasUnregisteredSession } from '@/lib/session';
import { isDemoLoginEnabled } from '@/lib/config';
import LoginPage from './page';

const mocked = {
  redirect: vi.mocked(redirect),
  resolveCurrentUser: vi.mocked(resolveCurrentUser),
  hasUnregisteredSession: vi.mocked(hasUnregisteredSession),
  isDemoLoginEnabled: vi.mocked(isDemoLoginEnabled),
};

function propsOf(element: unknown): { demoEnabled?: boolean } {
  return (element as { props: { demoEnabled?: boolean } }).props;
}

describe('LoginPage demo setting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.resolveCurrentUser.mockResolvedValue(null);
    mocked.hasUnregisteredSession.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('passes the enabled setting to the form', async () => {
    mocked.isDemoLoginEnabled.mockReturnValue(true);

    const element = await LoginPage({ searchParams: {} });

    expect(propsOf(element).demoEnabled).toBe(true);
  });

  it('passes the disabled setting to the form before markup is built', async () => {
    mocked.isDemoLoginEnabled.mockReturnValue(false);

    const element = await LoginPage({ searchParams: {} });

    expect(propsOf(element).demoEnabled).toBe(false);
    expect(mocked.isDemoLoginEnabled).toHaveBeenCalledTimes(1);
    expect(mocked.redirect).not.toHaveBeenCalled();
  });
});
