import { NextResponse } from 'next/server';
import {
  decodeThreadEmail,
  errorResponse,
  originGuard,
  parseJsonBody,
  withFailureLogging,
} from '@/lib/api';
import { logEvent } from '@/lib/log';
import { resolveCurrentUser } from '@/lib/session';
import { addChatMessage, findUserByEmail } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  return withFailureLogging('POST /api/chats/[userEmail]/messages', async () => {
    const blocked = originGuard(request);
    if (blocked) return blocked;

    const user = await resolveCurrentUser();
    if (!user) return errorResponse('Требуется вход в систему', 401);

    const { userEmail } = await params;
    const threadEmail = decodeThreadEmail(userEmail);
    if (!threadEmail) {
      return errorResponse('Некорректный идентификатор беседы', 400);
    }

    const isAdmin = user.role === 'admin';
    if (!isAdmin && threadEmail !== user.email.toLowerCase()) {
      logEvent('authorization', 'refused', {
        endpoint: 'POST /api/chats/[userEmail]/messages',
        account: user.email,
      });
      return errorResponse('Доступ к чужой переписке запрещён', 403);
    }

    const threadUser = await findUserByEmail(threadEmail);
    if (!threadUser) return errorResponse('Сотрудник не найден', 404);

    const body = await parseJsonBody<{ text?: string }>(request);
    const text = body?.text?.trim();
    if (!text) return errorResponse('Сообщение не может быть пустым', 400);

    const message = await addChatMessage({
      threadUserId: threadUser.id,
      authorId: user.id,
      isAdmin,
      text,
    });
    return NextResponse.json(message, { status: 201 });
  });
}
