import { NextResponse } from 'next/server';
import { errorResponse, isNonNegativeInt, parseJsonBody } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import {
  findUserById,
  hasDeclinedRefund,
  updateDonationAmount,
} from '@/lib/repository';
import type { RefundReason } from '@/lib/types';

export const dynamic = 'force-dynamic';

const REFUND_REASONS: RefundReason[] = ['refund_declined', 'emergency_refund'];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);
  if (user.role !== 'admin') {
    return errorResponse('Действие доступно только администратору', 403);
  }

  const body = await parseJsonBody<{
    newAmount?: unknown;
    reason?: string;
    comment?: string;
  }>(request);
  if (!body) return errorResponse('Некорректный запрос', 400);

  const reason = body.reason as RefundReason | undefined;
  const comment = body.comment?.trim();

  if (!reason || !REFUND_REASONS.includes(reason)) {
    return errorResponse('Укажите причину изменения', 400);
  }
  if (!comment) {
    return errorResponse('Комментарий обязателен', 400);
  }
  if (!isNonNegativeInt(body.newAmount)) {
    return errorResponse('Сумма должна быть неотрицательным целым числом', 400);
  }
  if (reason === 'refund_declined' && body.newAmount !== 0) {
    return errorResponse('При отказе от подарка сумма должна быть равна 0', 400);
  }

  const target = await findUserById(params.id);
  if (!target) return errorResponse('Сотрудник не найден', 404);

  if (await hasDeclinedRefund(target.id)) {
    return errorResponse('Изменение суммы недоступно: подарок возвращён', 409);
  }

  const result = await updateDonationAmount({
    userId: target.id,
    adminId: user.id,
    adminEmail: user.email,
    newAmount: body.newAmount,
    reason,
    comment,
  });
  if (!result) return errorResponse('Сбор не найден', 404);

  return NextResponse.json(result);
}
