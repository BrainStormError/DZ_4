import { NextResponse } from 'next/server';
import {
  decodeThreadEmail,
  errorResponse,
  originGuard,
  withFailureLogging,
} from '@/lib/api';
import { logEvent } from '@/lib/log';
import { resolveCurrentUser } from '@/lib/session';
import { findUserByEmail, markThreadRead } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  return withFailureLogging('POST /api/chats/[userEmail]/read', async () => {
    const blocked = originGuard(request);
    if (blocked) return blocked;

    const user = await resolveCurrentUser();
    if (!user) return errorResponse('Требуется вход в систему', 401);
    if (user.role !== 'admin') {
      logEvent('authorization', 'refused', {
        endpoint: 'POST /api/chats/[userEmail]/read',
        account: user.email,
      });
      return errorResponse('Действие доступно только администратору', 403);
    }

    const { userEmail } = await params;
    const threadEmail = decodeThreadEmail(userEmail);
    if (!threadEmail) {
      return errorResponse('Некорректный идентификатор беседы', 400);
    }

    const threadUser = await findUserByEmail(threadEmail);
    if (!threadUser) return errorResponse('Сотрудник не найден', 404);

    return NextResponse.json(await markThreadRead(threadEmail));
  });
}
