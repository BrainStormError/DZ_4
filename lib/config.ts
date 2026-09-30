const PLACEHOLDER_PREFIX = 'replace-with';

/**
 * Whether the demo sign-in is offered. It is enabled only by the documented
 * value `1`; anything else (unset, empty, `0`, `true`) keeps the strict
 * Google-only behaviour. Server-only: the value is read on the server for both
 * rendering the sign-in screen and refusing the demo provider.
 */
export function isDemoLoginEnabled(): boolean {
  return process.env.DEMO_LOGIN?.trim() === '1';
}

/**
 * Reads a signing secret from the environment and refuses to fall back to a
 * default. A missing value and the placeholder shipped in `.env.example` are
 * both reported as misconfiguration instead of being used to sign anything.
 */
export function requireSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Configuration error: ${name} is not set. Configure it before starting the application.`
    );
  }
  if (value.toLowerCase().startsWith(PLACEHOLDER_PREFIX)) {
    throw new Error(
      `Configuration error: ${name} still holds the example placeholder value. Set a real secret.`
    );
  }
  return value;
}
