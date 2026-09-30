export interface DemoAccount {
  email: string;
  label: string;
}

/**
 * The only source of the documented demo sign-in addresses. Both the server
 * allow-list gate and the sign-in screen hint read this list, so the addresses
 * that are shown and the addresses that are accepted cannot drift apart.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { email: 'anna.smirnova@company.com', label: 'Сотрудник' },
  { email: 'alexander.petrov@company.com', label: 'Администратор' },
];

/** Recognizes a documented demo address, ignoring case and surrounding space. */
export function isDemoAccount(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  return DEMO_ACCOUNTS.some((account) => account.email === normalized);
}
