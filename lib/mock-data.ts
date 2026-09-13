import type {
  User,
  Wish,
  Donation,
  DonationHistoryEntry,
  ChatThread,
} from './types';

function avatarDataUri(initials: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="150" height="150" rx="75" fill="url(#g)"/><text x="75" y="78" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const mockUsers: User[] = [
  {
    id: 'u1',
    fullName: 'Анна Смирнова',
    email: 'anna.smirnova@company.com',
    birthDate: '1990-09-13',
    department: 'Маркетинг',
    avatarUrl: avatarDataUri('АС', '#f97316', '#ea580c'),
    role: 'employee',
  },
  {
    id: 'u2',
    fullName: 'Дмитрий Волков',
    email: 'dmitry.volkov@company.com',
    birthDate: '1988-09-14',
    department: 'Разработка',
    avatarUrl: avatarDataUri('ДВ', '#3b82f6', '#1d4ed8'),
    role: 'employee',
  },
  {
    id: 'u3',
    fullName: 'Екатерина Лебедева',
    email: 'ekaterina.lebedeva@company.com',
    birthDate: '1992-09-25',
    department: 'Дизайн',
    avatarUrl: avatarDataUri('ЕЛ', '#10b981', '#047857'),
    role: 'employee',
  },
  {
    id: 'u4',
    fullName: 'Михаил Орлов',
    email: 'mikhail.orlov@company.com',
    birthDate: '1985-10-02',
    department: 'Разработка',
    avatarUrl: avatarDataUri('МО', '#8b5cf6', '#6d28d9'),
    role: 'employee',
  },
  {
    id: 'u5',
    fullName: 'Ольга Кузнецова',
    email: 'olga.kuznetsova@company.com',
    birthDate: '1995-10-15',
    department: 'HR',
    avatarUrl: avatarDataUri('ОК', '#ec4899', '#be185d'),
    role: 'employee',
  },
  {
    id: 'u6',
    fullName: 'Сергей Морозов',
    email: 'sergey.morozov@company.com',
    birthDate: '1987-11-05',
    department: 'Разработка',
    avatarUrl: avatarDataUri('СМ', '#14b8a6', '#0f766e'),
    role: 'employee',
  },
  {
    id: 'u7',
    fullName: 'Мария Зайцева',
    email: 'maria.zaytseva@company.com',
    birthDate: '1993-11-20',
    department: 'Финансы',
    avatarUrl: avatarDataUri('МЗ', '#f59e0b', '#b45309'),
    role: 'employee',
  },
  {
    id: 'u8',
    fullName: 'Павел Соколов',
    email: 'pavel.sokolov@company.com',
    birthDate: '1989-12-01',
    department: 'Разработка',
    avatarUrl: avatarDataUri('ПС', '#6366f1', '#4338ca'),
    role: 'employee',
  },
  {
    id: 'u9',
    fullName: 'Ирина Новикова',
    email: 'irina.novikova@company.com',
    birthDate: '1991-12-18',
    department: 'Маркетинг',
    avatarUrl: avatarDataUri('ИН', '#ef4444', '#b91c1c'),
    role: 'employee',
  },
  {
    id: 'u10',
    fullName: 'Александр Петров',
    email: 'alexander.petrov@company.com',
    birthDate: '1986-01-07',
    department: 'Управление',
    avatarUrl: avatarDataUri('АП', '#0ea5e9', '#0369a1'),
    role: 'admin',
  },
  {
    id: 'u11',
    fullName: 'Наталья Васильева',
    email: 'natalia.vasileva@company.com',
    birthDate: '1994-02-14',
    department: 'Дизайн',
    avatarUrl: avatarDataUri('НВ', '#a855f7', '#7e22ce'),
    role: 'employee',
  },
  {
    id: 'u12',
    fullName: 'Роман Михайлов',
    email: 'roman.mikhailov@company.com',
    birthDate: '1988-03-22',
    department: 'Разработка',
    avatarUrl: avatarDataUri('РМ', '#22c55e', '#15803d'),
    role: 'employee',
  },
];

export const mockWishes: Wish[] = [
  {
    id: 'w1',
    authorEmail: 'dmitry.volkov@company.com',
    targetUserId: 'u1',
    text: 'Анна, с днём рождения! Пусть каждый день приносит радость и вдохновение! 🎂',
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'w2',
    authorEmail: 'ekaterina.lebedeva@company.com',
    targetUserId: 'u1',
    text: 'С праздником, Анна! Желаю новых интересных проектов и тёплых улыбок!',
    createdAt: '2026-09-11T12:30:00Z',
  },
  {
    id: 'w3',
    authorEmail: 'olga.kuznetsova@company.com',
    targetUserId: 'u2',
    text: 'Дмитрий, с днём рождения! Код без багов и побольше кофе! ☕',
    createdAt: '2026-09-12T09:15:00Z',
  },
  {
    id: 'w4',
    authorEmail: 'anna.smirnova@company.com',
    targetUserId: 'u3',
    text: 'Катя, с днём рождения! Творческих успехов и ярких идей! 🎨',
    createdAt: '2026-09-08T14:00:00Z',
  },
  {
    id: 'w5',
    authorEmail: 'sergey.morozov@company.com',
    targetUserId: 'u5',
    text: 'Ольга, с праздником! Пусть в HR всегда царит гармония!',
    createdAt: '2026-09-09T16:45:00Z',
  },
  {
    id: 'w6',
    authorEmail: 'maria.zaytseva@company.com',
    targetUserId: 'u4',
    text: 'Михаил, с днём рождения! Здоровья и успехов во всех начинаниях!',
    createdAt: '2026-09-07T11:20:00Z',
  },
];

export const mockDonations: Donation[] = [
  { userId: 'u1', totalAmount: 12500 },
  { userId: 'u2', totalAmount: 8300 },
  { userId: 'u3', totalAmount: 15600 },
  { userId: 'u4', totalAmount: 4200 },
  { userId: 'u5', totalAmount: 9800 },
  { userId: 'u6', totalAmount: 6700 },
  { userId: 'u7', totalAmount: 11200 },
  { userId: 'u8', totalAmount: 5400 },
  { userId: 'u9', totalAmount: 7900 },
  { userId: 'u10', totalAmount: 0 },
  { userId: 'u11', totalAmount: 13400 },
  { userId: 'u12', totalAmount: 6100 },
];

export const mockDonationHistory: DonationHistoryEntry[] = [
  {
    id: 'h1',
    userId: 'u3',
    adminEmail: 'alexander.petrov@company.com',
    previousAmount: 17600,
    newAmount: 15600,
    reason: 'refund_declined',
    comment: 'Екатерина отказалась от подарка, возврат средств участникам.',
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'h2',
    userId: 'u7',
    adminEmail: 'alexander.petrov@company.com',
    previousAmount: 13200,
    newAmount: 11200,
    reason: 'emergency_refund',
    comment: 'Экстренный возврат по личной просьбе сотрудницы.',
    createdAt: '2026-09-08T14:30:00Z',
  },
];

export const mockChats: ChatThread[] = [
  {
    userEmail: 'anna.smirnova@company.com',
    messages: [
      {
        id: 'c1',
        authorEmail: 'anna.smirnova@company.com',
        text: 'Здравствуйте! А можно ли подарить больше указанной суммы?',
        isAdmin: false,
        createdAt: '2026-09-09T08:00:00Z',
        readByAdmin: true,
      },
      {
        id: 'c2',
        authorEmail: 'alexander.petrov@company.com',
        text: 'Здравствуйте, Анна! Да, конечно — любая сумма приветствуется, участие добровольное.',
        isAdmin: true,
        createdAt: '2026-09-09T09:30:00Z',
      },
    ],
  },
  {
    userEmail: 'dmitry.volkov@company.com',
    messages: [
      {
        id: 'c3',
        authorEmail: 'dmitry.volkov@company.com',
        text: 'Когда ближайший сбор? Хочу успеть поздравить коллегу.',
        isAdmin: false,
        createdAt: '2026-09-11T13:00:00Z',
      },
    ],
  },
];
