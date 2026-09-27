import { NextResponse } from 'next/server';
import { errorResponse, parseJsonBody } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import { addChatMessage, findUserByEmail } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { userEmail: string } }
) {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  const threadEmail = decodeURIComponent(params.userEmail).trim().toLowerCase();
  const isAdmin = user.role === 'admin';
  if (!isAdmin && threadEmail !== user.email.toLowerCase()) {
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
}
