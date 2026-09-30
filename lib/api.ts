import { NextResponse } from 'next/server';
import { logFailure } from './log';

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Runs a request handler and records an unexpected repository or database
 * failure as an `error` entry naming the failed operation, before answering the
 * client with the application's defined failure response. Validation and
 * authorization refusals are returned normally, not thrown, so they never reach
 * this path.
 */
export async function withFailureLogging(
  operation: string,
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await handler();
  } catch {
    logFailure(operation);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** Documented maximum for a single participation amount. */
export const MAX_PARTICIPATION_AMOUNT = 1_000_000;

/**
 * Documented maximum for a recipient's stored collection. Kept well below the
 * 32-bit integer limit so an accepted participation can never overflow the
 * stored total.
 */
export const MAX_COLLECTION_TOTAL = 1_000_000_000;

export function isParticipationAmount(value: unknown): value is number {
  return isPositiveInt(value) && value <= MAX_PARTICIPATION_AMOUNT;
}

/**
 * Decodes a thread identifier defensively: a malformed encoding yields `null`
 * so the route answers a documented client error instead of an internal one.
 */
export function decodeThreadEmail(raw: string): string | null {
  try {
    const decoded = decodeURIComponent(raw).trim().toLowerCase();
    return decoded || null;
  } catch {
    return null;
  }
}

function hostOf(value: string): string | null {
  try {
    return new URL(value).host || null;
  } catch {
    return null;
  }
}

/**
 * Defence in depth alongside the `SameSite=Lax` cookie policy: a state-changing
 * request from a foreign origin (or one the browser marks cross-site) is
 * refused, while a request that carries no origin information is allowed.
 */
export function isTrustedOrigin(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;

  const origin = request.headers.get('origin');
  if (!origin) return true;

  const originHost = hostOf(origin);
  if (!originHost) return false;

  const configuredHost = process.env.NEXTAUTH_URL
    ? hostOf(process.env.NEXTAUTH_URL)
    : null;
  const publicHost = configuredHost ?? request.headers.get('host');
  return Boolean(publicHost) && publicHost === originHost;
}

/** Returns a refusal response for a state-changing request from a foreign origin. */
export function originGuard(request: Request) {
  return isTrustedOrigin(request)
    ? null
    : errorResponse('Запрос отклонён: недопустимый источник', 403);
}
