import { NextResponse } from 'next/server';
import { errorResponse, originGuard, parseJsonBody } from '@/lib/api';
import { logEvent } from '@/lib/log';
import { resolveCurrentUser } from '@/lib/session';
import { findUserById, hasDeclinedRefund, setGiftSent } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);
  if (user.role !== 'admin') {
    logEvent('authorization', 'refused', {
      endpoint: 'PATCH /api/donations/[id]/gift-status',
      account: user.email,
    });
    return errorResponse('Действие доступно только администратору', 403);
  }

  const body = await parseJsonBody<{ sent?: unknown }>(request);
  if (typeof body?.sent !== 'boolean') {
    return errorResponse('Укажите статус подарка', 400);
  }

  const target = await findUserById(params.id);
  if (!target) return errorResponse('Сотрудник не найден', 404);

  if (await hasDeclinedRefund(target.id)) {
    return errorResponse('Изменение статуса недоступно: подарок возвращён', 409);
  }

  const donation = await setGiftSent(target.id, body.sent);
  if (!donation) return errorResponse('Сбор не найден', 404);

  return NextResponse.json(donation);
}
