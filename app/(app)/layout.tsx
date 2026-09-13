import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthGate } from '@/components/layout/AuthGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthGate>
  );
}
