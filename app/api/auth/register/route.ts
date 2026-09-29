import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { errorResponse, parseJsonBody } from '@/lib/api';
import {
  REGISTRATION_COOKIE_NAME,
  readRegistrationTicket,
} from '@/lib/registration-ticket';
import { createEmployeeUser, findUserByEmail } from '@/lib/repository';

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

function clearTicketCookie() {
  cookies().set(REGISTRATION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: (process.env.NEXTAUTH_URL ?? '').startsWith('https://'),
  });
}

export async function POST(request: Request) {
  const raw = cookies().get(REGISTRATION_COOKIE_NAME)?.value;
  const ticket = readRegistrationTicket(raw);
  if (!ticket) {
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
    clearTicketCookie();
    return NextResponse.json({ user: existing });
  }

  // The role is fixed to `employee`; registration cannot create an administrator.
  const user = await createEmployeeUser({
    email: ticket.email,
    fullName,
    birthDate,
    department,
    googleSub: ticket.googleSub,
  });

  clearTicketCookie();
  return NextResponse.json({ user }, { status: 201 });
}
