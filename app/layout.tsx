import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { DataProvider } from '@/lib/data-context';

export const metadata: Metadata = {
  title: 'Корпоративные подарки',
  description: 'Сервис корпоративных подарков: поздравляйте коллег с днём рождения вместе',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>{children}</DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
