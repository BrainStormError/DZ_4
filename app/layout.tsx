import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';
import { checkCorpEmail } from '@/lib/corp-email';
import { ThemeProvider } from '@/lib/theme-context';
import { DataProvider } from '@/lib/data-context';
import { DateProvider } from '@/lib/date-context';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

const fontVariables = manrope.variable;

const themeInitScript = `(function(){try{var t=localStorage.getItem('corp-gift-theme');var v=(t==='warm'||t==='festival'||t==='premium')?t:'warm';document.documentElement.setAttribute('data-theme',v);}catch(e){document.documentElement.setAttribute('data-theme','warm');}})();`;

export const metadata: Metadata = {
  title: 'Корпоративные подарки',
  description: 'Сервис корпоративных подарков: поздравляйте коллег с днём рождения вместе',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const email = cookies().get(AUTH_COOKIE_NAME)?.value;
  const auth = email ? checkCorpEmail(email) : null;
  const initialUser = auth?.ok && auth.user ? auth.user : null;

  return (
    <html lang="ru" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <DateProvider>
              <DataProvider>{children}</DataProvider>
            </DateProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
