import { NextResponse } from 'next/server';
import { errorResponse, withFailureLogging } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import { getChatThread, listChatThreads } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withFailureLogging('GET /api/chats', async () => {
    const user = await resolveCurrentUser();
    if (!user) return errorResponse('Требуется вход в систему', 401);

    if (user.role === 'admin') {
      return NextResponse.json(await listChatThreads());
    }

    return NextResponse.json([await getChatThread(user.email)]);
  });
}
