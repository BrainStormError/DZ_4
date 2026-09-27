export const CORP_EMAIL_DOMAIN = '@company.com';

export interface CorpEmailCheck {
  ok: boolean;
  error?: string;
}

/**
 * Pure domain rule: the address must be a corporate `@company.com` address.
 * The directory lookup lives in the repository/session layer.
 */
export function checkCorpEmail(email: string): CorpEmailCheck {
  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith(CORP_EMAIL_DOMAIN)) {
    return { ok: false, error: 'Используйте корпоративную почту @company.com' };
  }
  return { ok: true };
}
