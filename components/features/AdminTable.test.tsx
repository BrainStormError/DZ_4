import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { renderWithProviders } from '@/lib/test-utils';
import { AdminTable } from './AdminTable';
import type { User } from '@/lib/types';

const authState = vi.hoisted(() => ({
  user: null as User | null,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/auth-context', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    user: authState.user,
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

const employee: User = {
  id: 'u1',
  fullName: 'Анна Смирнова',
  email: 'anna.smirnova@company.com',
  birthDate: '1990-09-13',
  department: 'Маркетинг',
  avatarUrl: '',
  role: 'employee',
};

const admin: User = {
  id: 'u10',
  fullName: 'Александр Петров',
  email: 'alexander.petrov@company.com',
  birthDate: '1986-01-07',
  department: 'Управление',
  avatarUrl: '',
  role: 'admin',
};

describe('AdminTable', () => {
  it('employee sees access denied and no amounts table', async () => {
    authState.user = employee;
    renderWithProviders(<AdminTable />);

    expect(await screen.findByText('Доступ запрещён')).toBeInTheDocument();
    expect(screen.queryByText('Сумма сбора')).not.toBeInTheDocument();
  });

  it('admin sees the table and editing is gated by reason and comment', async () => {
    authState.user = admin;
    const user = userEvent.setup();
    renderWithProviders(<AdminTable />);

    expect(await screen.findByText('Таблица сборов')).toBeInTheDocument();
    expect(screen.getByText('Сумма сбора')).toBeInTheDocument();

    const editButtons = screen.getAllByRole('button', { name: 'Изменить' });
    const firstEnabled = editButtons.find((b) => !(b as HTMLButtonElement).disabled);
    expect(firstEnabled).toBeDefined();
    await user.click(firstEnabled as HTMLButtonElement);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Изменить сумму сбора')).toBeInTheDocument();

    const saveButton = within(dialog).getByRole('button', { name: 'Сохранить' });
    expect(saveButton).toBeDisabled();

    await user.click(within(dialog).getByRole('radio', { name: 'Экстренный возврат' }));
    expect(saveButton).toBeDisabled();

    await user.type(within(dialog).getByLabelText('Комментарий (обязательно)'), 'Возврат по запросу');
    expect(saveButton).toBeEnabled();
  });
});
