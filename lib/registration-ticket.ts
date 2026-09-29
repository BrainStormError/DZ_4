import { createHmac, timingSafeEqual } from 'node:crypto';

export const REGISTRATION_COOKIE_NAME = 'corp-gift-registration';
export const REGISTRATION_TTL_SECONDS = 10 * 60;

export interface RegistrationTicket {
  /** Address confirmed by Google; the identity key of the future record. */
  email: string;
  /** Full name from the Google profile, used to prefill the form. */
  fullName: string;
  /** Google subject id, stored so a Google-side email change cannot duplicate. */
  googleSub: string | null;
  /** Google profile picture, when the provider returned one. */
  avatarUrl: string | null;
  /** Expiry, milliseconds since the epoch. */
  exp: number;
}

function ticketSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      'NEXTAUTH_SECRET is not set. Configure the session secret before starting the application.'
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', ticketSecret()).update(payload).digest('base64url');
}

export function createRegistrationTicket(
  input: Omit<RegistrationTicket, 'exp'>,
  now: number = Date.now()
): string {
  const payload = Buffer.from(
    JSON.stringify({ ...input, exp: now + REGISTRATION_TTL_SECONDS * 1000 }),
    'utf8'
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readRegistrationTicket(
  raw: string | undefined | null,
  now: number = Date.now()
): RegistrationTicket | null {
  if (!raw) return null;

  const separator = raw.lastIndexOf('.');
  if (separator <= 0) return null;

  const payload = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);

  const expected = Buffer.from(sign(payload), 'utf8');
  const provided = Buffer.from(signature, 'utf8');
  if (expected.length !== provided.length) return null;
  if (!timingSafeEqual(expected, provided)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as Partial<RegistrationTicket>;
    if (typeof parsed.email !== 'string' || !parsed.email) return null;
    if (typeof parsed.exp !== 'number' || parsed.exp <= now) return null;
    return {
      email: parsed.email,
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
      googleSub: typeof parsed.googleSub === 'string' ? parsed.googleSub : null,
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : null,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}
