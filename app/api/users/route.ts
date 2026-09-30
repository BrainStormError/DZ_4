import { NextResponse } from 'next/server';
import { errorResponse, withFailureLogging } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import { listUsers, toPublicUser } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withFailureLogging('GET /api/users', async () => {
    const user = await resolveCurrentUser();
    if (!user) return errorResponse('Требуется вход в систему', 401);

    const users = await listUsers();
    return NextResponse.json(users.map(toPublicUser));
  });
}
