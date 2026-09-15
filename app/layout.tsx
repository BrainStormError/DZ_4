import './globals.css';
import type { Metadata } from 'next';
import { Nunito, Bricolage_Grotesque, Manrope, Fraunces, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { DataProvider } from '@/lib/data-context';
import { DateProvider } from '@/lib/date-context';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-nunito',
  display: 'swap',
  preload: true,
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  preload: false,
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  preload: false,
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  preload: false,
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

const fontVariables = [
  nunito.variable,
  bricolage.variable,
  manrope.variable,
  fraunces.variable,
  inter.variable,
].join(' ');

const themeInitScript = `(function(){try{var t=localStorage.getItem('corp-gift-theme');var v=(t==='warm'||t==='festival'||t==='premium')?t:'warm';document.documentElement.setAttribute('data-theme',v);}catch(e){document.documentElement.setAttribute('data-theme','warm');}})();`;

export const metadata: Metadata = {
  title: 'Корпоративные подарки',
  description: 'Сервис корпоративных подарков: поздравляйте коллег с днём рождения вместе',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
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
