import { mockUsers } from './mock-data';
import type { User } from './types';

export const CORP_EMAIL_DOMAIN = '@company.com';

export interface CorpEmailCheck {
  ok: boolean;
  user?: User;
  error?: string;
}

export function checkCorpEmail(email: string): CorpEmailCheck {
  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith(CORP_EMAIL_DOMAIN)) {
    return { ok: false, error: 'Используйте корпоративную почту @company.com' };
  }
  const found = mockUsers.find((u) => u.email === normalized);
  if (!found) {
    return { ok: false, error: 'Сотрудник не найден. Проверьте адрес почты.' };
  }
  return { ok: true, user: found };
}
