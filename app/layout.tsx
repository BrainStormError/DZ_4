import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import { resolveCurrentUser } from '@/lib/session';
import { ThemeProvider } from '@/lib/theme-context';
import { DateProvider } from '@/lib/date-context';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

const fontVariables = manrope.variable;

const themeInitScript = `(function(){try{var t=localStorage.getItem('corp-gift-theme');var v=(t==='warm'||t==='festival'||t==='premium')?t:'warm';document.documentElement.setAttribute('data-theme',v);}catch(e){document.documentElement.setAttribute('data-theme','warm');}})();`;

// The session is resolved from cookies on every request, and the signing
// secrets are required at runtime, not at build time. Keep every route
// dynamic so a production image can be built without secrets.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Корпоративные подарки',
  description: 'Сервис корпоративных подарков: поздравляйте коллег с днём рождения вместе',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await resolveCurrentUser();
  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <html lang="ru" className={fontVariables} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <DateProvider>{children}</DateProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
