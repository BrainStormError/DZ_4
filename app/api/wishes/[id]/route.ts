import { NextResponse } from 'next/server';
import { errorResponse, originGuard, parseJsonBody, withFailureLogging } from '@/lib/api';
import { logEvent } from '@/lib/log';
import { resolveCurrentUser } from '@/lib/session';
import { updateWishText } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withFailureLogging('PATCH /api/wishes/[id]', async () => {
    const blocked = originGuard(request);
    if (blocked) return blocked;

    const user = await resolveCurrentUser();
    if (!user) return errorResponse('Требуется вход в систему', 401);
    if (user.role !== 'admin') {
      logEvent('authorization', 'refused', {
        endpoint: 'PATCH /api/wishes/[id]',
        account: user.email,
      });
      return errorResponse('Действие доступно только администратору', 403);
    }

    const body = await parseJsonBody<{ text?: string }>(request);
    const text = body?.text?.trim();
    if (!text) return errorResponse('Текст пожелания не может быть пустым', 400);

    const { id } = await params;
    const wish = await updateWishText(id, text);
    if (!wish) return errorResponse('Пожелание не найдено', 404);

    return NextResponse.json(wish);
  });
}
