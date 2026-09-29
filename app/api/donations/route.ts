import { NextResponse } from 'next/server';
import {
  MAX_COLLECTION_TOTAL,
  MAX_PARTICIPATION_AMOUNT,
  errorResponse,
  isParticipationAmount,
  originGuard,
  parseJsonBody,
} from '@/lib/api';
import { hasBirthdayNotPassed } from '@/lib/birthdays';
import { resolveCurrentUser } from '@/lib/session';
import {
  findUserById,
  hasDeclinedRefund,
  listDeclinedUserIds,
  listDonationHistory,
  listDonations,
  submitParticipation,
} from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  // The collected amounts and the journal are administrator-only data.
  if (user.role !== 'admin') {
    return NextResponse.json({ declinedUserIds: await listDeclinedUserIds() });
  }

  const [donations, history] = await Promise.all([
    listDonations(),
    listDonationHistory(),
  ]);
  return NextResponse.json({ donations, history });
}

export async function POST(request: Request) {
  const blocked = originGuard(request);
  if (blocked) return blocked;

  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  const body = await parseJsonBody<{
    userId?: string;
    amount?: unknown;
    wishText?: string;
  }>(request);
  const userId = body?.userId;
  if (!userId) return errorResponse('Не выбран получатель', 400);
  if (!isParticipationAmount(body?.amount)) {
    return errorResponse(
      `Сумма должна быть целым числом от 1 до ${MAX_PARTICIPATION_AMOUNT}`,
      400
    );
  }

  const target = await findUserById(userId);
  if (!target) return errorResponse('Получатель не найден', 404);

  // Recipient eligibility is a server rule, not only an interface convenience.
  if (target.id === user.id) {
    return errorResponse('Нельзя участвовать в сборе для себя', 400);
  }
  if (!hasBirthdayNotPassed(new Date(), target)) {
    return errorResponse('День рождения получателя уже прошёл в этом году', 400);
  }
  if (await hasDeclinedRefund(target.id)) {
    return errorResponse('Получатель отказался от подарка', 400);
  }

  const wishText = body?.wishText?.trim() || undefined;
  const result = await submitParticipation({
    userId: target.id,
    amount: body.amount,
    authorId: user.id,
    wishText,
    maxTotal: MAX_COLLECTION_TOTAL,
  });
  if (!result) {
    return errorResponse('Достигнут максимальный размер сбора', 400);
  }

  // An employee's response must not carry the collected amount or the journal:
  // only the administrator receives the updated donation.
  if (user.role === 'admin') {
    return NextResponse.json(result, { status: 201 });
  }
  return NextResponse.json({ wish: result.wish }, { status: 201 });
}
