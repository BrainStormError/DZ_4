import type { User, Wish } from './types';

/**
 * Parse an ISO `yyyy-mm-dd` date as a local calendar date.
 * Using `new Date('1990-09-13')` parses as UTC and can shift the day in
 * negative-offset timezones, so we build the date from local components.
 */
export function parseIsoLocal(iso: string): Date {
  const [year, month, day] = iso.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function matchesMonthDay(birthDate: Date, date: Date): boolean {
  return birthDate.getMonth() === date.getMonth() && birthDate.getDate() === date.getDate();
}

/**
 * Employees whose birthday (month and day) matches the given date.
 */
export function getTodayBirthdays(today: Date, users: User[]): User[] {
  const base = startOfDay(today);
  return users.filter((u) => matchesMonthDay(parseIsoLocal(u.birthDate), base));
}

/**
 * Wishes shown on the board: only those addressed to people whose birthday
 * falls on the given date, newest first. The date is an explicit argument, so
 * the rule does not depend on the run date and never falls back to wishes of
 * past or future birthday dates.
 */
export function getBoardWishes(today: Date, users: User[], wishes: Wish[]): Wish[] {
  const targetIds = new Set(getTodayBirthdays(today, users).map((u) => u.id));
  return wishes
    .filter((w) => targetIds.has(w.targetUserId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * True when this year's birthday occurrence is today or still ahead.
 */
export function hasBirthdayNotPassed(today: Date, user: User): boolean {
  const base = startOfDay(today);
  const birthDate = parseIsoLocal(user.birthDate);
  const occurrence = new Date(base.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  return occurrence.getTime() >= base.getTime();
}

/**
 * Employees eligible for a money congratulation: birthday today or upcoming
 * this year, excluding the current user.
 */
export function getCongratulatableUsers(
  today: Date,
  users: User[],
  currentUserId?: string
): User[] {
  return users.filter((u) => u.id !== currentUserId && hasBirthdayNotPassed(today, u));
}

export const BIRTHDAY_PALETTE = [
  '#f97316',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
];

export function personColor(index: number): string {
  const length = BIRTHDAY_PALETTE.length;
  return BIRTHDAY_PALETTE[((index % length) + length) % length];
}

/**
 * Map every user to a stable personal color. Ordering is fixed by `fullName`,
 * so the same list always yields the same color for the same person.
 */
export function getPersonColors(users: User[]): Map<string, string> {
  const ordered = [...users].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
  const map = new Map<string, string>();
  ordered.forEach((u, index) => map.set(u.id, personColor(index)));
  return map;
}
