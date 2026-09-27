import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { DirectoryProvider } from '@/lib/directory-context';
import { DataProvider } from '@/lib/data-context';
import { DateProvider } from '@/lib/date-context';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <DateProvider>
          <DirectoryProvider>
            <DataProvider>{ui}</DataProvider>
          </DirectoryProvider>
        </DateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
