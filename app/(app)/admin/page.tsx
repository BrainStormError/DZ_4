import { AdminTable } from '@/components/features/AdminTable';
import { AdminAccessDenied } from '@/components/features/AdminAccessDenied';
import { resolveCurrentUser } from '@/lib/session';

export default async function AdminPage() {
  const user = await resolveCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {isAdmin ? <AdminTable /> : <AdminAccessDenied />}
    </div>
  );
}
