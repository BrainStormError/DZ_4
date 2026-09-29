const SENSITIVE_FIELD = /secret|session|ticket|credential|password|token/i;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/[\r\n]+/g, ' ').replace(CONTROL_CHARS, '');
  }
  return value;
}

/**
 * Emits exactly one structured entry per security-relevant event.
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
  const entry: Record<string, unknown> = {
    event,
    outcome,
    at: new Date().toISOString(),
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    entry[key] = SENSITIVE_FIELD.test(key) ? '[redacted]' : sanitize(value);
  }

  try {
    console.log(JSON.stringify(entry));
  } catch {
    // Logging is best-effort and must never fail a request.
  }
}
