import { redirect } from 'next/navigation';
import { resolveCurrentUser, hasUnregisteredSession } from '@/lib/session';
import { isDemoLoginEnabled } from '@/lib/config';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const user = await resolveCurrentUser();

  if (user) {
    redirect('/');
  }

  if (await hasUnregisteredSession()) {
    redirect('/register');
  }

  // The demo switch is read on the server so the disabled state is decided
  // before any markup is sent: with it off, only the Google control renders.
  return (
    <LoginForm
      error={searchParams?.error}
      demoEnabled={isDemoLoginEnabled()}
    />
  );
}
