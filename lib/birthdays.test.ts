import { describe, it, expect } from 'vitest';
import { getBoardWishes, getTodayBirthdays } from './birthdays';
import type { User, Wish } from './types';

function user(id: string, birthDate: string, role: User['role'] = 'employee'): User {
  return {
    id,
    fullName: `Сотрудник ${id}`,
    email: `${id}@company.com`,
    birthDate,
    department: 'Разработка',
    avatarUrl: '',
    role,
  };
}

const users: User[] = [
  user('today', '1990-05-15'),
  user('past', '1988-05-10'),
  user('future', '1992-05-20'),
  user('admin', '1986-05-15', 'admin'),
];

function wish(id: string, targetUserId: string, createdAt: string): Wish {
  return {
    id,
    authorEmail: 'author@company.com',
    targetUserId,
    text: `Пожелание ${id}`,
    createdAt,
  };
}

const wishes: Wish[] = [
  wish('w-today', 'today', '2026-05-15T09:00:00Z'),
  wish('w-past', 'past', '2026-05-10T09:00:00Z'),
  wish('w-future', 'future', '2026-05-20T09:00:00Z'),
];

const birthdayDate = new Date(2026, 4, 15);
const dayWithoutBirthdays = new Date(2026, 4, 12);

describe('getTodayBirthdays', () => {
  it('selects only people born on the given date, including admins', () => {
    expect(getTodayBirthdays(birthdayDate, users).map((u) => u.id)).toEqual(['today', 'admin']);
  });

  it('returns nothing when no one is born on the given date', () => {
    expect(getTodayBirthdays(dayWithoutBirthdays, users)).toEqual([]);
  });
});

describe('getBoardWishes', () => {
  it('shows a wish addressed to a birthday person of the given date', () => {
    const ids = getBoardWishes(birthdayDate, users, wishes).map((w) => w.id);
    expect(ids).toContain('w-today');
  });

  it('hides wishes addressed to past or future birthday dates', () => {
    const ids = getBoardWishes(birthdayDate, users, wishes).map((w) => w.id);
    expect(ids).not.toContain('w-past');
    expect(ids).not.toContain('w-future');
    expect(ids).toEqual(['w-today']);
  });

  it('does not fall back to a past birthday date when no one is born today', () => {
    expect(getBoardWishes(dayWithoutBirthdays, users, wishes)).toEqual([]);
  });

  it('sorts shown wishes newest first', () => {
    const twoWishes = [
      wish('older', 'today', '2026-05-15T08:00:00Z'),
      wish('newer', 'today', '2026-05-15T10:00:00Z'),
    ];
    expect(getBoardWishes(birthdayDate, users, twoWishes).map((w) => w.id)).toEqual([
      'newer',
      'older',
    ]);
  });
});
