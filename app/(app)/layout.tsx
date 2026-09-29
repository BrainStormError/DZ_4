import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PreviewBanner } from '@/components/layout/PreviewBanner';
import { resolveCurrentUser } from '@/lib/session';
import { DirectoryProvider } from '@/lib/directory-context';
import { DataProvider } from '@/lib/data-context';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await resolveCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DirectoryProvider>
      <DataProvider>
        <div className="min-h-[100dvh] flex flex-col">
          <Header />
          <PreviewBanner />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </DataProvider>
    </DirectoryProvider>
  );
}
