import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie';
import { checkCorpEmail } from '@/lib/corp-email';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  const email = cookies().get(AUTH_COOKIE_NAME)?.value;
  const auth = email ? checkCorpEmail(email) : null;

  if (auth?.ok && auth.user) {
    redirect('/');
  }

  return <LoginForm />;
}
