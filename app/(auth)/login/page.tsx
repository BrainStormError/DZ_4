import { redirect } from 'next/navigation';
import { resolveCurrentUser, hasUnregisteredSession } from '@/lib/session';
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

  return <LoginForm error={searchParams?.error} />;
}
