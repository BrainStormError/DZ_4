import { NextResponse } from 'next/server';
import { errorResponse, parseJsonBody } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import { createWish, findUserById, listWishes } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  return NextResponse.json(await listWishes());
}

export async function POST(request: Request) {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  const body = await parseJsonBody<{ targetUserId?: string; text?: string }>(request);
  const targetUserId = body?.targetUserId;
  const text = body?.text?.trim();
  if (!targetUserId || !text) {
    return errorResponse('Укажите получателя и текст пожелания', 400);
  }

  const target = await findUserById(targetUserId);
  if (!target) return errorResponse('Получатель не найден', 404);

  const wish = await createWish({ authorId: user.id, targetUserId: target.id, text });
  return NextResponse.json(wish, { status: 201 });
}
