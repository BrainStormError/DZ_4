import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from './providers';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

const fontVariables = manrope.variable;

const themeInitScript = `(function(){try{var t=localStorage.getItem('corp-gift-theme');var v=(t==='warm'||t==='festival'||t==='premium')?t:'warm';document.documentElement.setAttribute('data-theme',v);}catch(e){document.documentElement.setAttribute('data-theme','warm');}})();`;

const metrikaScript = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=113274971','ym');ym(113274971,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`;

// The session is resolved from cookies on every request, and the signing
// secrets are required at runtime, not at build time. Keep every route
// dynamic so a production image can be built without secrets.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Корпоративные подарки',
  description: 'Сервис корпоративных подарков: поздравляйте коллег с днём рождения вместе',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce') ?? undefined;

  return (
    <html lang="ru" className={fontVariables} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: metrikaScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/113274971"
              style={{ position: 'absolute', left: -9999 }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
