import { NextResponse } from 'next/server';
import { errorResponse, parseJsonBody } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import { updateWishText } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);
  if (user.role !== 'admin') {
    return errorResponse('Действие доступно только администратору', 403);
  }

  const body = await parseJsonBody<{ text?: string }>(request);
  const text = body?.text?.trim();
  if (!text) return errorResponse('Текст пожелания не может быть пустым', 400);

  const wish = await updateWishText(params.id, text);
  if (!wish) return errorResponse('Пожелание не найдено', 404);

  return NextResponse.json(wish);
}
