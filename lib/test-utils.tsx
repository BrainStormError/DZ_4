import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
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
  return render(
    <ThemeProvider>
      <AuthProvider initialUser={user}>
        <DateProvider>
          <DirectoryProvider>
            <DataProvider>{ui}</DataProvider>
          </DirectoryProvider>
        </DateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
