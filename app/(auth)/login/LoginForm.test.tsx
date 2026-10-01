import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/lib/test-utils';
import { DEMO_ACCOUNTS } from '@/lib/demo-accounts';
import { LoginForm } from './LoginForm';

const mockSession = {
  user: {
    id: 'u1',
    email: 'test@company.com',
    name: 'Test User',
    image: '',
  },
  expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  userId: 'u1',
  fullName: 'Test User',
  role: 'employee' as const,
  avatarUrl: '',
  birthDate: '1990-01-01',
  department: 'Test',
  googleSub: null,
};

vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useSession: () => ({ data: mockSession, status: 'authenticated' }),
  };
});

import { signIn } from 'next-auth/react';

afterEach(() => {
  cleanup();
});

const DEMO_EMAIL = 'anna.smirnova@company.com';
const ADMIN_EMAIL = 'alexander.petrov@company.com';

describe('LoginForm with the demo sign-in enabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the demo email field above the Google control', () => {
    renderWithProviders(<LoginForm demoEnabled />);

    const email = screen.getByLabelText('Тестовый адрес');
    const google = screen.getByRole('button', { name: /Войти через Google/ });

    expect(
      email.compareDocumentPosition(google) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('names both documented addresses in the test-data hint', () => {
    renderWithProviders(<LoginForm demoEnabled />);

    const hint = screen.getByTestId('demo-hint');

    expect(hint).toHaveTextContent(DEMO_EMAIL);
    expect(hint).toHaveTextContent(ADMIN_EMAIL);
    expect(hint).toHaveTextContent(/тестов/i);
  });

  it('submits the entered address to the demo provider', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm demoEnabled />);

    await user.type(screen.getByLabelText('Тестовый адрес'), DEMO_EMAIL);
    await user.click(
      screen.getByRole('button', { name: /Войти как тестовый пользователь/ })
    );

    expect(signIn).toHaveBeenCalledWith('demo', {
      email: DEMO_EMAIL,
      callbackUrl: '/',
    });
  });

  it('keeps the two documented addresses in sync with the allow-list', () => {
    renderWithProviders(<LoginForm demoEnabled />);

    for (const account of DEMO_ACCOUNTS) {
      expect(screen.getByTestId('demo-hint')).toHaveTextContent(account.email);
    }
  });
});

describe('LoginForm with the demo sign-in disabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('offers only the Google control', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.queryByLabelText('Тестовый адрес')).not.toBeInTheDocument();
    expect(screen.queryByTestId('demo-hint')).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Войти через Google/ })
    ).toHaveLength(1);
  });
});
