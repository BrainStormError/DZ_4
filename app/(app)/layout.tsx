import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthGate } from '@/components/layout/AuthGate';
import { PreviewBanner } from '@/components/layout/PreviewBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-[100dvh] flex flex-col">
        <Header />
        <PreviewBanner />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthGate>
  );
}
