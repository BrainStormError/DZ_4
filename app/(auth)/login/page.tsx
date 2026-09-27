import { redirect } from 'next/navigation';
import { resolveCurrentUser } from '@/lib/session';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const user = await resolveCurrentUser();

  if (user) {
    redirect('/');
  }

  return <LoginForm />;
}
