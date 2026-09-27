import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from './auth-cookie';
import { findUserByEmail } from './repository';
import type { User } from './types';

export async function resolveCurrentUser(): Promise<User | null> {
  const raw = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;

  let email = raw;
  try {
    email = decodeURIComponent(raw);
  } catch {
    // keep the raw value if it is not a valid percent-encoded string
  }

  return findUserByEmail(email);
}
