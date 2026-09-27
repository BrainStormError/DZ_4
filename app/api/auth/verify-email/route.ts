import { NextResponse } from 'next/server';
import { checkCorpEmail } from '@/lib/corp-email';
import { findUserByEmail } from '@/lib/repository';
import { errorResponse, parseJsonBody } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await parseJsonBody<{ email?: string }>(request);
  if (!body || typeof body.email !== 'string') {
    return errorResponse('Некорректный запрос', 400);
  }

  const email = body.email.trim().toLowerCase();
  const rule = checkCorpEmail(email);
  if (!rule.ok) {
    return NextResponse.json({ ok: false, error: rule.error });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({
      ok: false,
      error: 'Сотрудник не найден. Проверьте адрес почты.',
    });
  }

  return NextResponse.json({ ok: true, user });
}
