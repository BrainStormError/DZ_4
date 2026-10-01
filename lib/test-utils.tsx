import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/theme-context';
import { DirectoryProvider } from '@/lib/directory-context';
import { DataProvider } from '@/lib/data-context';
import { DateProvider } from '@/lib/date-context';
import type { User } from '@/lib/types';

/**
 * Renders a component with the application providers. Pass `user` to simulate
 * the server-resolved session, which is the only session shape the client
 * reads now (`{ user, login, logout }`, with a no-argument `login`).
 */
export function renderWithProviders(
  ui: ReactElement,
  { user = null }: { user?: User | null } = {}
) {
  const session = user
    ? {
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.avatarUrl,
        },
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        userId: user.id,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        birthDate: user.birthDate,
        department: user.department,
        googleSub: user.googleSub,
      }
    : undefined;

  return render(
    <SessionProvider session={session}>
      <ThemeProvider>
        <DateProvider>
          <DirectoryProvider>
            <DataProvider>{ui}</DataProvider>
          </DirectoryProvider>
        </DateProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
