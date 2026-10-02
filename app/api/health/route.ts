import { NextResponse } from 'next/server';
import { pingDatabase } from '@/lib/db';
import { logEvent } from '@/lib/log';

export const dynamic = 'force-dynamic';

const READINESS_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error('readiness check timed out'));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function GET() {
  try {
    await withTimeout(pingDatabase(), READINESS_TIMEOUT_MS);
  } catch {
    logEvent('readiness_checked', 'refused');
    return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  }
  return NextResponse.json({ status: 'ok' });
}
