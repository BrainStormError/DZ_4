import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  errorResponse,
  originGuard,
  parseJsonBody,
  withFailureLogging,
} from '@/lib/api';
import { registrationCookieAttributes, registrationCookieName } from '@/lib/cookies';
import { logEvent } from '@/lib/log';
import { readRegistrationTicket } from '@/lib/registration-ticket';
import {
  createEmployeeUser,
  findUserByEmail,
  toPublicUser,
} from '@/lib/repository';
import { getUnregisteredEmail } from '@/lib/session';

export const dynamic = 'force-dynamic';

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

async function clearTicketCookie() {
  (await cookies()).set(registrationCookieName(), '', registrationCookieAttributes(0));
}

export async function POST(request: Request) {
  return withFailureLogging('POST /api/auth/register', async () => {
    const blocked = originGuard(request);
    if (blocked) return blocked;

    const raw = (await cookies()).get(registrationCookieName())?.value;
    const ticket = readRegistrationTicket(raw);
    if (!ticket) {
      return errorResponse('Регистрация не начата или истекла. Войдите заново.', 401);
    }

    // A ticket is accepted only together with the unregistered session that
    // produced it, whose confirmed address must match the ticket's.
    const sessionEmail = await getUnregisteredEmail();
    if (!sessionEmail || sessionEmail !== ticket.email.trim().toLowerCase()) {
      return errorResponse('Регистрация не начата или истекла. Войдите заново.', 401);
    }

    const body = await parseJsonBody<{
      fullName?: unknown;
      birthDate?: unknown;
      department?: unknown;
    }>(request);
    if (!body) {
      return errorResponse('Некорректный запрос', 400);
    }

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const birthDate = typeof body.birthDate === 'string' ? body.birthDate.trim() : '';
    const department =
      typeof body.department === 'string' ? body.department.trim() : '';

    if (!fullName) return errorResponse('Укажите полное имя', 400);
    if (!isIsoDate(birthDate)) return errorResponse('Укажите корректную дату рождения', 400);
    if (!department) return errorResponse('Укажите отдел', 400);

    const existing = await findUserByEmail(ticket.email);
    if (existing) {
      await clearTicketCookie();
      logEvent('registration', 'already_registered', { account: ticket.email });
      return NextResponse.json({ user: toPublicUser(existing) });
    }

    // The role is fixed to `employee`; registration cannot create an administrator.
    // The insert is conflict-safe, so a concurrent or replayed submission creates
    // no second record and does not end in an internal error.
    const user = await createEmployeeUser({
      email: ticket.email,
      fullName,
      birthDate,
      department,
      googleSub: ticket.googleSub,
    });

    await clearTicketCookie();

    if (!user) {
      const raced = await findUserByEmail(ticket.email);
      logEvent('registration', 'already_registered', { account: ticket.email });
      return NextResponse.json({ user: raced ? toPublicUser(raced) : null });
    }

    logEvent('registration', 'created', { account: ticket.email });
    return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  });
}
