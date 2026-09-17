import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { renderWithProviders } from '@/lib/test-utils';
import { DonateDialog } from './DonateDialog';
import type { User } from '@/lib/types';

const mocks = vi.hoisted(() => ({
  addDonation: vi.fn(),
  addWish: vi.fn(),
  history: [] as never[],
  wishes: [] as never[],
  donations: [] as never[],
  chats: [] as never[],
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/auth-context', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    user: {
      id: 'u2',
      fullName: 'Дмитрий Волков',
      email: 'dmitry.volkov@company.com',
      birthDate: '1988-09-14',
      department: 'Разработка',
      avatarUrl: '',
      role: 'employee',
    } as User,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/date-context', () => ({
  DateProvider: ({ children }: { children: ReactNode }) => children,
  useAppDate: () => ({
    today: new Date(2026, 8, 14),
    isPreview: false,
    previewDate: null,
    setPreviewDate: vi.fn(),
    resetDate: vi.fn(),
  }),
}));

vi.mock('@/lib/data-context', () => ({
  DataProvider: ({ children }: { children: ReactNode }) => children,
  useWishes: () => ({
    wishes: mocks.wishes,
    addWish: mocks.addWish,
    updateWish: vi.fn(),
  }),
  useDonations: () => ({
    donations: mocks.donations,
    history: mocks.history,
    addDonation: mocks.addDonation,
    setGiftSent: vi.fn(),
    updateDonation: vi.fn(),
  }),
}));

const targetUser: User = {
  id: 'u1',
  fullName: 'Анна Смирнова',
  email: 'anna.smirnova@company.com',
  birthDate: '1990-09-13',
  department: 'Маркетинг',
  avatarUrl: '',
  role: 'employee',
};

describe('DonateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('happy path: completes donation and shows success step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonateDialog open onOpenChange={vi.fn()} targetUser={targetUser} />);

    const emailInput = await screen.findByLabelText('Ваша корпоративная почта');
    expect(emailInput).toHaveValue('dmitry.volkov@company.com');
    await user.click(screen.getByRole('button', { name: 'Продолжить' }));

    const amountInput = await screen.findByLabelText('Сумма (₽)');
    await user.type(amountInput, '500');
    await user.click(screen.getByRole('button', { name: 'Продолжить' }));

    const messageInput = await screen.findByLabelText('Текст поздравления');
    await user.type(messageInput, 'Поздравляю!');
    await user.click(screen.getByRole('button', { name: 'Продолжить' }));

    const confirmButton = await screen.findByRole('button', { name: 'Поздравить' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mocks.addDonation).toHaveBeenCalledWith('u1', 500);
    });
    expect(mocks.addWish).toHaveBeenCalledWith({
      authorEmail: 'dmitry.volkov@company.com',
      targetUserId: 'u1',
      text: 'Поздравляю!',
    });

    expect(await screen.findByText('Готово!')).toBeInTheDocument();
  });

  it('validation error: blocks non-corporate email and does not call addDonation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DonateDialog open onOpenChange={vi.fn()} targetUser={targetUser} />);

    const emailInput = await screen.findByLabelText('Ваша корпоративная почта');
    fireEvent.change(emailInput, { target: { value: 'user@gmail.com' } });
    await user.click(screen.getByRole('button', { name: 'Продолжить' }));

    const error = await screen.findByText(/Используйте корпоративную почту/);
    expect(error).toBeInTheDocument();

    expect(screen.queryByLabelText('Сумма (₽)')).not.toBeInTheDocument();
    expect(mocks.addDonation).not.toHaveBeenCalled();
  });
});
