import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { findUserById } from './repository';
import type { User } from './types';

export async function resolveCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.userId;
  if (!userId) return null;

  // The token carries only the id; the stored record stays authoritative for
  // existence and role, so deleting a row ends the session on the next request.
  return findUserById(userId);
}

export async function hasUnregisteredSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session?.unregistered && !session.userId);
}
