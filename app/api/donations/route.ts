import { NextResponse } from 'next/server';
import { errorResponse, isPositiveInt, parseJsonBody } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import {
  findUserById,
  listDonationHistory,
  listDonations,
  submitParticipation,
} from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  const [donations, history] = await Promise.all([
    listDonations(),
    listDonationHistory(),
  ]);
  return NextResponse.json({ donations, history });
}

export async function POST(request: Request) {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  const body = await parseJsonBody<{
    userId?: string;
    amount?: unknown;
    wishText?: string;
  }>(request);
  const userId = body?.userId;
  if (!userId) return errorResponse('Не выбран получатель', 400);
  if (!isPositiveInt(body?.amount)) {
    return errorResponse('Сумма должна быть положительным целым числом', 400);
  }

  const target = await findUserById(userId);
  if (!target) return errorResponse('Получатель не найден', 404);

  const wishText = body?.wishText?.trim() || undefined;
  const result = await submitParticipation({
    userId: target.id,
    amount: body.amount,
    authorId: user.id,
    wishText,
  });

  return NextResponse.json(result, { status: 201 });
}
