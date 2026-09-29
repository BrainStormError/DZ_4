import {
  bindUserGoogleSub,
  findUserByEmail,
  findUserByGoogleSub,
} from './repository';
import type { User } from './types';

export type SignInResolution =
  | { status: 'known'; user: User }
  | { status: 'unknown' }
  | { status: 'subject_mismatch' };

/**
 * Resolves the stored record for a confirmed Google account.
 *
 * - A record that already carries a subject is accepted only when the subject
 *   matches; otherwise the sign-in is refused.
 * - A record without a subject is resolved by address and gets the subject
 *   recorded on this sign-in.
 * - A record reached by subject while the address changed is resolved instead
 *   of creating a second profile.
 */
export async function resolveSignInUser(
  email: string,
  googleSub: string | null
): Promise<SignInResolution> {
  const byEmail = await findUserByEmail(email);
  if (byEmail) {
    if (byEmail.googleSub) {
      return byEmail.googleSub === googleSub
        ? { status: 'known', user: byEmail }
        : { status: 'subject_mismatch' };
    }
    if (googleSub) {
      const bound = await bindUserGoogleSub(byEmail.id, googleSub);
      return { status: 'known', user: bound ?? { ...byEmail, googleSub } };
    }
    return { status: 'known', user: byEmail };
  }

  if (googleSub) {
    const bySub = await findUserByGoogleSub(googleSub);
    if (bySub) return { status: 'known', user: bySub };
  }

  return { status: 'unknown' };
}
