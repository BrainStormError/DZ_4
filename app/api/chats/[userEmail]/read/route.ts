import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import { findUserByEmail, markThreadRead } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: { userEmail: string } }
) {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);
  if (user.role !== 'admin') {
    return errorResponse('Действие доступно только администратору', 403);
  }

  const threadEmail = decodeURIComponent(params.userEmail).trim().toLowerCase();
  const threadUser = await findUserByEmail(threadEmail);
  if (!threadUser) return errorResponse('Сотрудник не найден', 404);

  return NextResponse.json(await markThreadRead(threadEmail));
}
