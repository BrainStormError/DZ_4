-- Corporate gifts demo schema.
-- Ids stay `text` so the seeded demo rows keep the mock values (u1, w1, c1, ...).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('employee', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_reason') THEN
    CREATE TYPE refund_reason AS ENUM ('refund_declined', 'emergency_refund');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
  id         text PRIMARY KEY,
  full_name  text NOT NULL,
  email      text NOT NULL UNIQUE,
  birth_date date NOT NULL,
  department text NOT NULL,
  avatar_url text NOT NULL,
  role       user_role NOT NULL DEFAULT 'employee',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishes (
  id             text PRIMARY KEY,
  author_id      text NOT NULL REFERENCES users (id),
  target_user_id text NOT NULL REFERENCES users (id),
  text           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wishes_target_created_idx
  ON wishes (target_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS donations (
  user_id      text PRIMARY KEY REFERENCES users (id),
  total_amount integer NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  gift_sent    boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS donation_history (
  id              text PRIMARY KEY,
  user_id         text NOT NULL REFERENCES users (id),
  admin_id        text NOT NULL REFERENCES users (id),
  previous_amount integer NOT NULL CHECK (previous_amount >= 0),
  new_amount      integer NOT NULL CHECK (new_amount >= 0),
  reason          refund_reason NOT NULL,
  comment         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id             text PRIMARY KEY,
  thread_user_id text NOT NULL REFERENCES users (id),
  author_id      text NOT NULL REFERENCES users (id),
  text           text NOT NULL,
  is_admin       boolean NOT NULL DEFAULT false,
  read_by_admin  boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_thread_created_idx
  ON chat_messages (thread_user_id, created_at);
