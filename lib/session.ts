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

/**
 * The confirmed address carried by an active unregistered session, or `null`.
 * A registration ticket is accepted only together with this session.
 */
export async function getUnregisteredEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.unregistered || session.userId) return null;
  const email = session.user?.email?.trim().toLowerCase();
  return email || null;
}
