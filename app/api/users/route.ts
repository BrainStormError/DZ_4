import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api';
import { resolveCurrentUser } from '@/lib/session';
import { listUsers } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await resolveCurrentUser();
  if (!user) return errorResponse('Требуется вход в систему', 401);

  const users = await listUsers();
  return NextResponse.json(users);
}
