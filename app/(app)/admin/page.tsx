import { cookies } from 'next/headers';
import { AdminTable } from '@/components/features/AdminTable';
import { AdminAccessDenied } from '@/components/features/AdminAccessDenied';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';
import { checkCorpEmail } from '@/lib/corp-email';

export default function AdminPage() {
  const email = cookies().get(AUTH_COOKIE_NAME)?.value;
  const auth = email ? checkCorpEmail(email) : null;
  const isAdmin = Boolean(auth?.ok && auth.user?.role === 'admin');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {isAdmin ? <AdminTable /> : <AdminAccessDenied />}
    </div>
  );
}
