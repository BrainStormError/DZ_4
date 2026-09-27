# План: перенос данных на PostgreSQL + Docker для сервера 1 ГБ

## Цель

Заменить клиентские mock-данные (`lib/mock-data.ts`, `lib/data-store.ts`) на PostgreSQL,
сохранив всё текущее поведение и спецификации, и подготовить минимальный Docker-стек
(приложение + БД) для сервера с 1 ГБ RAM. Всё, кроме сборки образа, работает на сервере.

## Зафиксированные решения

1. **Полная интеграция**: состояние и мутации читаются/пишутся в Postgres.
2. **Доступ к БД**: Route Handlers (`app/api/**/route.ts`) + пакет `pg` (node-postgres). Без ORM.
3. **Сборы**: агрегат по получателю (`donations.total_amount`), как сейчас. Кто сколько дал — не храним.
4. **Размещение**: `app` + `db` в одном `docker-compose.yml` на одном сервере 1 ГБ.
   Образ приложения собирается **вне сервера** (локально/в CI); на сервере только `docker compose up`.
5. **Тесты**: новые автотесты для слоя БД не пишем — ручная проверка. Существующие тесты
   (`AdminTable.test.tsx`, `DonateDialog.test.tsx`) обновляем, чтобы `npm test` оставался зелёным.

## Ответ по 1 ГБ RAM

- Полезные данные < 1 МБ, индексы — единицы МБ; объём данных не является ограничением.
- Рантайм: Postgres (1 соединение, тюнинг) ~180–250 МБ + Next.js `next start` ~150–250 МБ
  + Docker daemon ~100 МБ → **~400–600 МБ, влезает**.
- Единственный реальный риск — `next build` (> 1 ГБ). Поэтому образ собирается вне сервера.
- Тюнинг Postgres для 1 ГБ (флаги в `command`):
  `shared_buffers=128MB`, `effective_cache_size=256MB`, `work_mem=4MB`,
  `maintenance_work_mem=32MB`, `max_connections=20`, `wal_buffers=8MB`.
- Лимиты контейнеров: `db` ~384 МБ, `app` ~384 МБ.

## Схема БД

Идентификаторы сохраняем строковыми и теми же, что в mock (`u1`, `w1`, `c1`, `h1`) —
это исключает переписывание UI и тестов. Новые строки получают id через
`replace(gen_random_uuid()::text, ...)` или через `crypto.randomUUID()` на сервере.

```sql
create type user_role     as enum ('employee','admin');
create type refund_reason as enum ('refund_declined','emergency_refund');

create table users (
  id          text primary key,
  full_name   text not null,
  email       text not null unique,
  birth_date  date not null,               -- год не используется, сравниваются месяц/день
  department  text not null default '',
  avatar_url  text not null default '',    -- data-URI, как в mock
  role        user_role not null default 'employee',
  created_at  timestamptz not null default now()
);

create table wishes (
  id             text primary key,
  author_id      text not null references users(id),   -- вместо authorEmail-строки
  target_user_id text not null references users(id),
  text           text not null,
  created_at     timestamptz not null default now()
);
create index wishes_target_created_idx on wishes (target_user_id, created_at desc);

create table donations (                   -- агрегат по получателю
  user_id      text primary key references users(id),
  total_amount integer not null default 0 check (total_amount >= 0),
  gift_sent    boolean not null default false
);

create table donation_history (
  id              text primary key,
  user_id         text not null references users(id),
  admin_id        text not null references users(id),  -- вместо adminEmail
  previous_amount integer not null check (previous_amount >= 0),
  new_amount      integer not null check (new_amount >= 0),
  reason          refund_reason not null,
  comment         text not null,
  created_at      timestamptz not null default now()
);

create table chat_messages (
  id             text primary key,
  thread_user_id text not null references users(id),   -- чья ветка (сотрудник)
  author_id      text not null references users(id),
  is_admin       boolean not null,
  text           text not null,
  read_by_admin  boolean not null default false,
  created_at     timestamptz not null default now()
);
create index chat_thread_created_idx on chat_messages (thread_user_id, created_at);
```

Отдельная таблица `threads` не нужна: ветка = группировка по `thread_user_id`.
Маппинг из текущих типов (`lib/types.ts`): `Wish.authorEmail → author_id`,
`DonationHistoryEntry.adminEmail → admin_id`, `ChatThread.userEmail` → группировка,
`ChatMessage.authorEmail → author_id`.

## API-поверхность (Route Handlers)

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/api/auth/login` | проверка email по БД для формы входа (замена `checkCorpEmail` на клиенте) |
| POST | `/api/auth/verify-email` | проверка email отправителя в `DonateDialog` |
| GET | `/api/users` | справочник (замена `mockUsers` во всех клиентских компонентах) |
| GET | `/api/wishes` | доска пожеланий |
| POST | `/api/wishes` | создание пожелания |
| PATCH | `/api/wishes/[id]` | редактирование текста админом |
| GET | `/api/donations` | таблица сборов + журнал (только admin) |
| POST | `/api/donations` | добавить сумму получателю (+ пожелание, если текст непустой) — в одной транзакции |
| PATCH | `/api/donations/[id]` | изменение суммы админом + запись в журнал |
| PATCH | `/api/donations/[id]/gift-status` | «Отправлено/Не отправлено» |
| GET | `/api/chats` | админ — все ветки, сотрудник — только своя |
| POST | `/api/chats/[userEmail]/messages` | отправка сообщения |
| POST | `/api/chats/[userEmail]/read` | сброс непрочитанного (admin) |

Все роуты — `export const dynamic = 'force-dynamic'`. Авторизация: читаем cookie
`corp-gift-auth-email`, резолвим пользователя из `users`. Роль проверяется на сервере.

## Файлы: новые и изменяемые

Новые:
- `lib/db.ts` — singleton `pg.Pool` (через `globalThis`, чтобы не течь при HMR), читает `DATABASE_URL`.
- `lib/repository.ts` — серверные запросы (users/wishes/donations/history/chats).
- `lib/session.ts` — `resolveCurrentUser()` (cookie → `users`).
- `lib/directory-context.tsx` — провайдер справочника: `GET /api/users`, отдаёт `users`
  и состояния загрузки/ошибки.
- `app/api/**/route.ts` — перечень выше.
- `db/init/001_schema.sql`, `db/init/002_seed.sql` — схема и сиды из `lib/mock-data.ts`.
- `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`.

Изменяемые:
- `next.config.js` — добавить `output: 'standalone'`.
- `lib/corp-email.ts` — оставить чистую проверку домена; поиск по справочнику — через БД/API.
- `lib/auth-context.tsx` — `login` становится `async` и вызывает `POST /api/auth/login`.
- `app/layout.tsx`, `app/(app)/layout.tsx`, `app/(app)/admin/page.tsx`,
  `app/(auth)/login/page.tsx` — `await resolveCurrentUser()` вместо синхронного `checkCorpEmail`.
- `lib/data-store.ts` / `lib/data-context.tsx` — заменить `useState(mock...)` на загрузку с API
  и мутации через `fetch`; сохранить имена полей/функций, чтобы компоненты не менять.
- `app/(app)/page.tsx`, `app/(app)/calendar/page.tsx`, `components/features/WishBoard.tsx`,
  `DonateDialog.tsx`, `AdminTable.tsx`, `ChatThread.tsx` — убрать `import { mockUsers }`,
  брать справочник из `useDirectory()`.
- `components/features/AdminTable.test.tsx`, `DonateDialog.test.tsx` — актуализировать моки.
- `README.md` — раздел про Postgres/Docker/переменные окружения.
- `package.json` — зависимость `pg` (+ `@types/pg` в dev).

## Docker-артефакты

- `Dockerfile` (multi-stage):
  - `deps`: `npm ci`
  - `build`: `npm run build` (нужен `output: 'standalone'`)
  - `runner`: `node:18-alpine`, копировать `.next/standalone`, `.next/static`, `public`;
    `CMD ["node","server.js"]`, `EXPOSE 3000`.
- `docker-compose.yml`:
  - `db`: `postgres:16-alpine`, `env_file .env`, том `db_data:/var/lib/postgresql/data`,
    флаги тюнинга из раздела RAM, `healthcheck` (`pg_isready`), `mem_limit: 384m`.
  - `app`: `image: corp-gifts:latest` (собран вне сервера и доставлен через реестр/`docker save`),
    `depends_on: db (service_healthy)`, `DATABASE_URL`, порт `3000`, `mem_limit: 384m`,
    `restart: unless-stopped`.
  - `db/init/*.sql` монтируется в `/docker-entrypoint-initdb.d` — применяется один раз, на пустом томе.
- `.env.example`: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`.
- `.dockerignore`: `node_modules`, `.next`, `.git`, `openspec`.

## Порядок работ

1. Схема и сиды: `db/init/001_schema.sql`, `002_seed.sql` из `lib/mock-data.ts` (12 users, 6 wishes,
   12 donations, 2 history, 2 threads). Запустить локально Postgres, убедиться, что сиды применились.
2. `lib/db.ts`, `lib/repository.ts`, `lib/session.ts`.
3. Route Handlers по таблице API.
4. `lib/directory-context.tsx`; подключить в `app/layout.tsx`; заменить `mockUsers` в 6 компонентах.
5. Перевести `lib/auth-context.tsx` на `POST /api/auth/login`; перевести серверные layout/страницы
   на `await resolveCurrentUser()`.
6. Перевести `lib/data-store.ts`/`data-context.tsx` на API (те же имена методов).
7. Обновить существующие тесты; прогнать `npm run lint`, `npm run typecheck`, `npm test`.
8. `output: 'standalone'` в `next.config.js`; добавить `pg`/`@types/pg`.
9. `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`; обновить `README.md`.
10. Ручная проверка (см. ниже), затем финальные lint/typecheck/test.

## Ручная проверка (валидация)

- `docker compose up -d db`; затем `npm run dev` с `DATABASE_URL` — приложение работает на Postgres.
- Вход `anna.smirnova@company.com` и `alexander.petrov@company.com` (админ).
- Доска пожеланий: создание видно после перезагрузки (персистентность).
- `DonateDialog`: вклад добавляется, сумма растёт; при непустом тексте создаётся пожелание; при пустом — нет.
- Админка: таблица сумм, изменение суммы с обязательной причиной/комментарием → запись в журнал;
  отказ от подарка обнуляет сумму.
- Чат: сотрудник видит только свою ветку; админ видит все и отвечает; счётчик непрочитанного очищается при открытии.
- Полный стек: собрать образ вне сервера, `docker compose up -d` на 1 ГБ, проверить `docker stats`
  (суммарно < ~700 МБ) и `curl` по ключевым страницам.

## Риски и ограничения

- Схема БД: миграций нет — `db/init` применяется только на пустом томе; изменения схемы = ручной `ALTER`.
- Контекст данных держит всё состояние на клиенте; при первом рендере появятся состояния загрузки
  (спецификация `async-states` это допускает) — нужно не сломать SSR-разметку и LCP-бюджеты (`specs/performance`).
- `pg.Pool` в dev/HMR без singleton приведёт к утечке соединений — обязателен `globalThis`-синглтон.
- Неподписанная cookie (`corp-gift-auth-email`) остаётся демо-уровнем; реальная аутентификация — вне объёма.
- Учётных данных в compose — секреты в `.env`; для демо допустимо, для прода не подходит.
- Возврат средств конкретным вкладчикам невозможен (агрегат) — осознанно вне объёма.

## Вне объёма

- ORM, миграционный фреймворк, CI.
- Смена модели сборов на `contributions`.
- Реальная аутентификация/подпись cookie, RLS.
- Хранение тем и FAQ в БД (остаются в коде/localStorage).
