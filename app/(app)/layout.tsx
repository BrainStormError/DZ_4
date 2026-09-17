import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PreviewBanner } from '@/components/layout/PreviewBanner';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';
import { checkCorpEmail } from '@/lib/corp-email';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const email = cookies().get(AUTH_COOKIE_NAME)?.value;
  const auth = email ? checkCorpEmail(email) : null;

  if (!auth?.ok || !auth.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header />
      <PreviewBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
