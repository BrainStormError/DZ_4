'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/theme-context';
import { DateProvider } from '@/lib/date-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <DateProvider>{children}</DateProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
