import { randomUUID } from 'node:crypto';
import { defaultAvatarUrl } from './avatar';
import { query, withTransaction } from './db';
import type {
  ChatMessage,
  ChatThread,
  Donation,
  DonationHistoryEntry,
  PublicUser,
  RefundReason,
  User,
  Wish,
} from './types';

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  google_sub: string | null;
  birth_date: string;
  department: string;
  avatar_url: string;
  role: User['role'];
};

const USER_COLUMNS =
  "id, full_name, email, google_sub, to_char(birth_date, 'YYYY-MM-DD') AS birth_date, department, avatar_url, role";

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    googleSub: row.google_sub,
    birthDate: row.birth_date,
    department: row.department,
    avatarUrl: row.avatar_url,
    role: row.role,
  };
}

/** Drops the provider subject id and any other internal identity value. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    birthDate: user.birthDate,
    department: user.department,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

export async function listUsers(): Promise<User[]> {
  const rows = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users ORDER BY length(id), id`
  );
  return rows.map(mapUser);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const rows = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [email.trim()]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const rows = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserByGoogleSub(googleSub: string): Promise<User | null> {
  const rows = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE google_sub = $1 LIMIT 1`,
    [googleSub]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

/**
 * Records the provider subject on a record that has none, on its first
 * sign-in. A record that already carries a different subject is left untouched.
 */
export async function bindUserGoogleSub(
  id: string,
  googleSub: string
): Promise<User | null> {
  const rows = await query<UserRow>(
    `UPDATE users SET google_sub = $2
     WHERE id = $1 AND google_sub IS NULL
     RETURNING ${USER_COLUMNS}`,
    [id, googleSub]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

/**
 * Creates a user from a completed registration form. The role is fixed to
 * `employee`: there is no parameter to request another role, so registration
 * can never produce an administrator.
 *
 * The insert is conflict-safe, so two simultaneous submissions for the same
 * address create exactly one record and the loser receives `null` instead of an
 * internal error.
 */
export async function createEmployeeUser(input: {
  email: string;
  fullName: string;
  birthDate: string;
  department: string;
  googleSub?: string | null;
}): Promise<User | null> {
  const fullName = input.fullName.trim();
  const rows = await query<UserRow>(
    `INSERT INTO users (id, full_name, email, google_sub, birth_date, department, avatar_url, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'employee')
     ON CONFLICT DO NOTHING
     RETURNING ${USER_COLUMNS}`,
    [
      'u' + randomUUID(),
      fullName,
      input.email.trim().toLowerCase(),
      input.googleSub ?? null,
      input.birthDate,
      input.department.trim(),
      defaultAvatarUrl(fullName),
    ]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

type WishRow = {
  id: string;
  author_email: string;
  target_user_id: string;
  text: string;
  created_at: Date;
};

function mapWish(row: WishRow): Wish {
  return {
    id: row.id,
    authorEmail: row.author_email,
    targetUserId: row.target_user_id,
    text: row.text,
    createdAt: toIso(row.created_at),
  };
}

const WISH_SELECT = `SELECT i.id, u.email AS author_email, i.target_user_id, i.text, i.created_at
  FROM inserted i JOIN users u ON u.id = i.author_id`;

export async function listWishes(): Promise<Wish[]> {
  const rows = await query<WishRow>(
    `SELECT w.id, u.email AS author_email, w.target_user_id, w.text, w.created_at
     FROM wishes w JOIN users u ON u.id = w.author_id
     ORDER BY w.created_at DESC`
  );
  return rows.map(mapWish);
}

export async function createWish(input: {
  authorId: string;
  targetUserId: string;
  text: string;
}): Promise<Wish> {
  const rows = await query<WishRow>(
    `WITH inserted AS (
       INSERT INTO wishes (id, author_id, target_user_id, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, author_id, target_user_id, text, created_at
     )
     ${WISH_SELECT}`,
    ['w' + randomUUID(), input.authorId, input.targetUserId, input.text]
  );
  return mapWish(rows[0]);
}

export async function updateWishText(
  id: string,
  text: string
): Promise<Wish | null> {
  const rows = await query<WishRow>(
    `WITH updated AS (
       UPDATE wishes SET text = $2 WHERE id = $1
       RETURNING id, author_id, target_user_id, text, created_at
     )
     SELECT up.id, u.email AS author_email, up.target_user_id, up.text, up.created_at
     FROM updated up JOIN users u ON u.id = up.author_id`,
    [id, text]
  );
  return rows[0] ? mapWish(rows[0]) : null;
}

type DonationRow = {
  user_id: string;
  total_amount: number;
  gift_sent: boolean;
};

function mapDonation(row: DonationRow): Donation {
  return {
    userId: row.user_id,
    totalAmount: Number(row.total_amount),
    giftSent: row.gift_sent,
  };
}

export async function listDonations(): Promise<Donation[]> {
  const rows = await query<DonationRow>(
    `SELECT user_id, total_amount, gift_sent FROM donations ORDER BY length(user_id), user_id`
  );
  return rows.map(mapDonation);
}

/** Identifiers of recipients who declined the gift, without any amount. */
export async function listDeclinedUserIds(): Promise<string[]> {
  const rows = await query<{ user_id: string }>(
    `SELECT DISTINCT user_id FROM donation_history WHERE reason = 'refund_declined'`
  );
  return rows.map((row) => row.user_id);
}

export async function submitParticipation(input: {
  userId: string;
  amount: number;
  authorId: string;
  wishText?: string;
  /** Upper bound for the stored total; the update is refused above it. */
  maxTotal?: number;
}): Promise<{ donation: Donation; wish: Wish | null } | null> {
  return withTransaction(async (client) => {
    const maxTotal = input.maxTotal ?? Number.MAX_SAFE_INTEGER;
    const donationResult = await client.query<DonationRow>(
      `INSERT INTO donations (user_id, total_amount, gift_sent)
       VALUES ($1, $2, false)
       ON CONFLICT (user_id) DO UPDATE
         SET total_amount = donations.total_amount + EXCLUDED.total_amount
         WHERE donations.total_amount + EXCLUDED.total_amount <= $3
       RETURNING user_id, total_amount, gift_sent`,
      [input.userId, input.amount, maxTotal]
    );

    // The guard refused the accumulation: leave the store untouched.
    if (donationResult.rows.length === 0) return null;

    let wish: Wish | null = null;
    if (input.wishText && input.wishText.trim()) {
      const wishResult = await client.query<WishRow>(
        `WITH inserted AS (
           INSERT INTO wishes (id, author_id, target_user_id, text)
           VALUES ($1, $2, $3, $4)
           RETURNING id, author_id, target_user_id, text, created_at
         )
         ${WISH_SELECT}`,
        ['w' + randomUUID(), input.authorId, input.userId, input.wishText.trim()]
      );
      wish = wishResult.rows[0] ? mapWish(wishResult.rows[0]) : null;
    }

    return { donation: mapDonation(donationResult.rows[0]), wish };
  });
}

export async function setGiftSent(
  userId: string,
  sent: boolean
): Promise<Donation | null> {
  const rows = await query<DonationRow>(
    `UPDATE donations SET gift_sent = $2 WHERE user_id = $1
     RETURNING user_id, total_amount, gift_sent`,
    [userId, sent]
  );
  return rows[0] ? mapDonation(rows[0]) : null;
}

export async function hasDeclinedRefund(userId: string): Promise<boolean> {
  const rows = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM donation_history WHERE user_id = $1 AND reason = 'refund_declined'
     ) AS exists`,
    [userId]
  );
  return Boolean(rows[0]?.exists);
}

type DonationHistoryRow = {
  id: string;
  user_id: string;
  admin_id: string;
  previous_amount: number;
  new_amount: number;
  reason: RefundReason;
  comment: string;
  created_at: Date;
};

export async function listDonationHistory(): Promise<DonationHistoryEntry[]> {
  const rows = await query<DonationHistoryRow & { admin_email: string }>(
    `SELECT h.id, h.user_id, h.admin_id, h.previous_amount, h.new_amount, h.reason, h.comment,
            h.created_at, a.email AS admin_email
     FROM donation_history h JOIN users a ON a.id = h.admin_id
     ORDER BY h.created_at DESC`
  );
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    adminEmail: row.admin_email,
    previousAmount: Number(row.previous_amount),
    newAmount: Number(row.new_amount),
    reason: row.reason,
    comment: row.comment,
    createdAt: toIso(row.created_at),
  }));
}

export async function updateDonationAmount(input: {
  userId: string;
  adminId: string;
  adminEmail: string;
  newAmount: number;
  reason: RefundReason;
  comment: string;
}): Promise<{ donation: Donation; entry: DonationHistoryEntry } | null> {
  return withTransaction(async (client) => {
    const currentResult = await client.query<{
      total_amount: number;
      gift_sent: boolean;
    }>(
      `SELECT total_amount, gift_sent FROM donations WHERE user_id = $1 FOR UPDATE`,
      [input.userId]
    );
    if (currentResult.rows.length === 0) return null;
    const previousAmount = Number(currentResult.rows[0].total_amount);

    const updatedResult = await client.query<DonationRow>(
      `UPDATE donations SET total_amount = $2 WHERE user_id = $1
       RETURNING user_id, total_amount, gift_sent`,
      [input.userId, input.newAmount]
    );

    const entryResult = await client.query<DonationHistoryRow>(
      `INSERT INTO donation_history (id, user_id, admin_id, previous_amount, new_amount, reason, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, admin_id, previous_amount, new_amount, reason, comment, created_at`,
      [
        'h' + randomUUID(),
        input.userId,
        input.adminId,
        previousAmount,
        input.newAmount,
        input.reason,
        input.comment,
      ]
    );

    const entryRow = entryResult.rows[0];
    return {
      donation: mapDonation(updatedResult.rows[0]),
      entry: {
        id: entryRow.id,
        userId: entryRow.user_id,
        adminEmail: input.adminEmail,
        previousAmount: Number(entryRow.previous_amount),
        newAmount: Number(entryRow.new_amount),
        reason: entryRow.reason,
        comment: entryRow.comment,
        createdAt: toIso(entryRow.created_at),
      },
    };
  });
}

type ChatRow = {
  id: string;
  thread_user_email: string;
  author_email: string;
  text: string;
  is_admin: boolean;
  read_by_admin: boolean;
  created_at: Date;
};

const CHAT_SELECT = `SELECT m.id, t.email AS thread_user_email, u.email AS author_email,
    m.text, m.is_admin, m.read_by_admin, m.created_at
  FROM chat_messages m
  JOIN users u ON u.id = m.author_id
  JOIN users t ON t.id = m.thread_user_id`;

function mapChatMessage(row: ChatRow): ChatMessage {
  return {
    id: row.id,
    authorEmail: row.author_email,
    text: row.text,
    isAdmin: row.is_admin,
    createdAt: toIso(row.created_at),
    readByAdmin: row.read_by_admin,
  };
}

export async function listChatThreads(): Promise<ChatThread[]> {
  const rows = await query<ChatRow>(`${CHAT_SELECT} ORDER BY t.email, m.created_at`);
  const threads = new Map<string, ChatThread>();
  for (const row of rows) {
    const thread =
      threads.get(row.thread_user_email) ??
      ({ userEmail: row.thread_user_email, messages: [] } satisfies ChatThread);
    thread.messages.push(mapChatMessage(row));
    threads.set(row.thread_user_email, thread);
  }
  return Array.from(threads.values());
}

export async function getChatThread(userEmail: string): Promise<ChatThread> {
  const rows = await query<ChatRow>(
    `${CHAT_SELECT} WHERE lower(t.email) = lower($1) ORDER BY m.created_at`,
    [userEmail]
  );
  return { userEmail, messages: rows.map(mapChatMessage) };
}

export async function addChatMessage(input: {
  threadUserId: string;
  authorId: string;
  isAdmin: boolean;
  text: string;
}): Promise<ChatMessage> {
  const rows = await query<ChatRow>(
    `WITH inserted AS (
       INSERT INTO chat_messages (id, thread_user_id, author_id, text, is_admin, read_by_admin)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, thread_user_id, author_id, text, is_admin, read_by_admin, created_at
     )
     SELECT i.id, t.email AS thread_user_email, u.email AS author_email,
            i.text, i.is_admin, i.read_by_admin, i.created_at
     FROM inserted i
     JOIN users u ON u.id = i.author_id
     JOIN users t ON t.id = i.thread_user_id`,
    ['c' + randomUUID(), input.threadUserId, input.authorId, input.text, input.isAdmin]
  );
  return mapChatMessage(rows[0]);
}

export async function markThreadRead(userEmail: string): Promise<ChatThread> {
  await query(
    `UPDATE chat_messages m
     SET read_by_admin = true
     FROM users t
     WHERE m.thread_user_id = t.id
       AND lower(t.email) = lower($1)
       AND m.is_admin = false`,
    [userEmail]
  );
  return getChatThread(userEmail);
}
