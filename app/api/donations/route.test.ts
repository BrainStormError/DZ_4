import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@/lib/types';

const sessionState = vi.hoisted(() => ({ user: null as unknown }));

vi.mock('@/lib/session', () => ({
  resolveCurrentUser: vi.fn(async () => sessionState.user),
}));

vi.mock('@/lib/birthdays', () => ({ hasBirthdayNotPassed: vi.fn() }));

vi.mock('@/lib/log', () => ({ logEvent: vi.fn() }));

const repo = vi.hoisted(() => ({
  findUserById: vi.fn(),
  hasDeclinedRefund: vi.fn(),
  listDeclinedUserIds: vi.fn(),
  listDonationHistory: vi.fn(),
  listDonations: vi.fn(),
  submitParticipation: vi.fn(),
}));

vi.mock('@/lib/repository', () => repo);

import { hasBirthdayNotPassed } from '@/lib/birthdays';
import { GET, POST } from './route';

const employee: User = {
  id: 'u2',
  fullName: 'Дмитрий Волков',
  email: 'dmitry@example.com',
  googleSub: null,
  birthDate: '1988-09-14',
  department: 'Разработка',
  avatarUrl: '',
  role: 'employee',
};

const recipient: User = {
  id: 'u1',
  fullName: 'Анна Смирнова',
  email: 'anna@example.com',
  googleSub: null,
  birthDate: '1990-09-13',
  department: 'Маркетинг',
  avatarUrl: '',
  role: 'employee',
};

function request(body: unknown): Request {
  return new Request('http://localhost/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/donations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repo.listDeclinedUserIds.mockResolvedValue(['u1']);
    repo.listDonations.mockResolvedValue([{ userId: 'u1', totalAmount: 500, giftSent: false }]);
    repo.listDonationHistory.mockResolvedValue([
      {
        id: 'h1',
        userId: 'u1',
        adminEmail: 'admin@example.com',
        previousAmount: 1000,
        newAmount: 500,
        reason: 'emergency_refund',
        comment: 'refund',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('gives an employee only the declined identifiers, no amounts or journal', async () => {
    sessionState.user = employee;

    const response = await GET();
    const body = (await response.json()) as Record<string, unknown>;

    expect(body).toEqual({ declinedUserIds: ['u1'] });
    expect(body).not.toHaveProperty('donations');
    expect(JSON.stringify(body)).not.toContain('totalAmount');
    expect(JSON.stringify(body)).not.toContain('adminEmail');
  });

  it('gives an administrator the amounts and the full journal', async () => {
    sessionState.user = { ...employee, id: 'u0', role: 'admin' };

    const response = await GET();
    const body = (await response.json()) as { donations: unknown[]; history: unknown[] };

    expect(body.donations).toHaveLength(1);
    expect(body.history).toHaveLength(1);
  });
});

describe('POST /api/donations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionState.user = employee;
    repo.findUserById.mockResolvedValue(recipient);
    repo.hasDeclinedRefund.mockResolvedValue(false);
    vi.mocked(hasBirthdayNotPassed).mockReturnValue(true);
    repo.submitParticipation.mockResolvedValue({
      donation: { userId: 'u1', totalAmount: 500, giftSent: false },
      wish: null,
    });
  });

  it('refuses an amount above the documented maximum without touching the store', async () => {
    const response = await POST(
      request({ userId: 'u1', amount: 1_000_001 })
    );

    expect(response.status).toBe(400);
    expect(repo.submitParticipation).not.toHaveBeenCalled();
  });

  it('accepts the largest documented amount', async () => {
    const response = await POST(request({ userId: 'u1', amount: 1_000_000 }));

    expect(response.status).toBe(201);
    expect(repo.submitParticipation).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1_000_000 })
    );
  });

  it('refuses when the stored total would exceed the accepted range', async () => {
    repo.submitParticipation.mockResolvedValueOnce(null);

    const response = await POST(request({ userId: 'u1', amount: 500 }));

    expect(response.status).toBe(400);
  });

  it('does not disclose an amount to an employee response', async () => {
    const response = await POST(request({ userId: 'u1', amount: 500 }));

    const body = (await response.json()) as Record<string, unknown>;
    expect(body).not.toHaveProperty('donation');
    expect(JSON.stringify(body)).not.toContain('totalAmount');
  });

  it('refuses a contribution to oneself', async () => {
    repo.findUserById.mockResolvedValue(employee);

    const response = await POST(request({ userId: employee.id, amount: 500 }));

    expect(response.status).toBe(400);
    expect(repo.submitParticipation).not.toHaveBeenCalled();
  });

  it('refuses a recipient whose birthday has already occurred', async () => {
    vi.mocked(hasBirthdayNotPassed).mockReturnValue(false);

    const response = await POST(request({ userId: 'u1', amount: 500 }));

    expect(response.status).toBe(400);
    expect(repo.submitParticipation).not.toHaveBeenCalled();
  });

  it('refuses a recipient who declined the gift and leaves the collection untouched', async () => {
    repo.hasDeclinedRefund.mockResolvedValue(true);

    const response = await POST(request({ userId: 'u1', amount: 500 }));

    expect(response.status).toBe(400);
    expect(repo.submitParticipation).not.toHaveBeenCalled();
  });

  it('accepts an eligible recipient', async () => {
    const response = await POST(request({ userId: 'u1', amount: 500 }));

    expect(response.status).toBe(201);
    expect(repo.submitParticipation).toHaveBeenCalledOnce();
  });
});
