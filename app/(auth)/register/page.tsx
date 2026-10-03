import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { registrationCookieName } from '@/lib/cookies';
import { readRegistrationTicket } from '@/lib/registration-ticket';
import { RegistrationForm } from './RegistrationForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const raw = (await cookies()).get(registrationCookieName())?.value;
  const ticket = readRegistrationTicket(raw);

  // Without a valid, unexpired ticket there is nothing to register.
  if (!ticket) {
    redirect('/login');
  }

  return (
    <RegistrationForm
      email={ticket.email}
      defaultFullName={ticket.fullName}
    />
  );
}
