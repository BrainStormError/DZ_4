const SENSITIVE_FIELD = /secret|session|ticket|credential|password|token/i;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

export type LogLevel = 'info' | 'warn' | 'error';

/**
 * Fixed mapping from a recorded outcome to its severity. An outcome that is not
 * listed — an unexpected failure — is recorded as `error`.
 */
const LEVEL_BY_OUTCOME: Record<string, LogLevel> = {
  accepted: 'info',
  created: 'info',
  success: 'info',
  refused: 'warn',
  already_registered: 'warn',
};

export function levelForOutcome(outcome: string): LogLevel {
  return LEVEL_BY_OUTCOME[outcome] ?? 'error';
}

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/[\r\n]+/g, ' ').replace(CONTROL_CHARS, '');
  }
  return value;
}

function emit(level: LogLevel, line: string): void {
  if (level === 'info') console.log(line);
  else if (level === 'warn') console.warn(line);
  else console.error(line);
}

/**
 * Emits exactly one structured entry per security-relevant event.
 *
 * The entry always carries a `level` (`info`, `warn`, or `error`) derived from
 * the recorded outcome, so severity is a property of the outcome rather than an
 * argument a caller can forget or contradict. `warn` and `error` entries go to
 * the standard-error stream and `info` entries stay on standard output, so the
 * host's log collection can handle the two severities differently.
 *
 * Fields whose name marks a secret, session, ticket, or credential are
 * redacted; string values taken from a request have line breaks and control
 * characters removed so a value cannot forge or reshape an entry. The helper
 * never throws, so logging cannot break a request.
 */
export function logEvent(
  event: string,
  outcome: string,
  fields: Record<string, unknown> = {}
): void {
  const level = levelForOutcome(outcome);
  const entry: Record<string, unknown> = {
    level,
    event,
    outcome,
    at: new Date().toISOString(),
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    entry[key] = SENSITIVE_FIELD.test(key) ? '[redacted]' : sanitize(value);
  }

  try {
    emit(level, JSON.stringify(entry));
  } catch {
    // Logging is best-effort and must never fail a request.
  }
}

/**
 * Records an unexpected operation failure as an `error` entry naming the failed
 * operation. Best-effort: it never throws, so it can be called from a request's
 * failure path without changing the response the client receives.
 */
export function logFailure(
  operation: string,
  fields: Record<string, unknown> = {}
): void {
  logEvent('request_failed', 'failed', { operation, ...fields });
}
