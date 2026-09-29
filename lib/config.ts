const PLACEHOLDER_PREFIX = 'replace-with';

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
