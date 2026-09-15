import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { DataProvider } from '@/lib/data-context';
import { DateProvider } from '@/lib/date-context';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <DateProvider>
          <DataProvider>{ui}</DataProvider>
        </DateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
