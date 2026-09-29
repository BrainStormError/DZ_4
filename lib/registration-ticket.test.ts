// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  REGISTRATION_TTL_SECONDS,
  createRegistrationTicket,
  readRegistrationTicket,
} from './registration-ticket';

process.env.NEXTAUTH_SECRET = 'test-secret';

const payload = {
  email: 'new.person@example.com',
  fullName: 'Новый Сотрудник',
  googleSub: 'google-sub-1',
  avatarUrl: null,
};

describe('registration ticket', () => {
  it('round-trips a signed ticket', () => {
    const ticket = createRegistrationTicket(payload, 1_000);

    expect(readRegistrationTicket(ticket, 1_000)).toMatchObject({
      email: 'new.person@example.com',
      fullName: 'Новый Сотрудник',
      googleSub: 'google-sub-1',
    });
  });

  it('expires after the short lifetime', () => {
    const ticket = createRegistrationTicket(payload, 1_000);

    const afterExpiry = 1_000 + (REGISTRATION_TTL_SECONDS + 1) * 1000;
    expect(readRegistrationTicket(ticket, afterExpiry)).toBeNull();
  });

  it('rejects a modified ticket', () => {
    const ticket = createRegistrationTicket(payload, 1_000);
    const [encoded, signature] = ticket.split('.');

    const modified = Buffer.from(
      JSON.stringify({ ...payload, email: 'attacker@example.com', exp: Date.now() + 60_000 }),
      'utf8'
    ).toString('base64url');

    expect(readRegistrationTicket(`${modified}.${signature}`, 1_000)).toBeNull();
    expect(readRegistrationTicket(`${encoded}.${signature.slice(0, -2)}xx`, 1_000)).toBeNull();
    expect(readRegistrationTicket(signature, 1_000)).toBeNull();
    expect(readRegistrationTicket(undefined, 1_000)).toBeNull();
  });
});
