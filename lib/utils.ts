import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NON_NEGATIVE_INT = /^\d+$/;

export function parsePositiveInt(raw: string): number | null {
  const value = parseNonNegativeInt(raw);
  if (value === null || value <= 0) return null;
  return value;
}

export function parseNonNegativeInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!NON_NEGATIVE_INT.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) return null;
  return value;
}

export function pluralizeRu(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

const MONTHS_PREPOSITIONAL = [
  'январе',
  'феврале',
  'марте',
  'апреле',
  'мае',
  'июне',
  'июле',
  'августе',
  'сентябре',
  'октябре',
  'ноябре',
  'декабре',
];

export function prepositionalMonth(monthIndex: number): string {
  return MONTHS_PREPOSITIONAL[((monthIndex % 12) + 12) % 12];
}
