# Форматы ответов API

Все успешные и неуспешные ответы — JSON. Ошибки единообразны: `{"error": "<текст>"}`.

## Успешные ответы

| № | Endpoint | Код | Тело ответа | Тип |
| --- | --- | --- | --- | --- |
| 1 | `GET/POST /api/auth/[...nextauth]` | — | ответы в формате NextAuth: сессия, редирект на Google или на `/login` | разное |
| 2 | `POST /api/auth/register` | `201` | `{user}` (проекция без `googleSub`) | объект |
| 3 | `GET /api/users` | `200` | `User[]` (проекция без `googleSub`) | массив |
| 4 | `GET /api/wishes` | `200` | `Wish[]` | массив |
| 5 | `POST /api/wishes` | `201` | `Wish` | объект |
| 6 | `PATCH /api/wishes/[id]` | `200` | `Wish` | объект |
| 7 | `GET /api/donations` | `200` | `admin`: `{donations, history}`; `employee`: `{declinedUserIds}` | объект |
| 8 | `POST /api/donations` | `201` | `admin`: `{donation, wish}`; `employee`: `{wish}` | объект, `wish` может быть `null` |
| 9 | `PATCH /api/donations/[id]` | `200` | `{donation, entry}` | объект |
| 10 | `PATCH /api/donations/[id]/gift-status` | `200` | `Donation` | объект |
| 11 | `GET /api/chats` | `200` | `ChatThread[]` | массив |
| 12 | `POST /api/chats/[userEmail]/messages` | `201` | `ChatMessage` | объект |
| 13 | `POST /api/chats/[userEmail]/read` | `200` | `ChatThread` | объект |

Особый случай: маршрут NextAuth `GET/POST /api/auth/[...nextauth]` отвечает в собственном формате (JSON-сессия, редирект на Google, редирект на `/login?error=...`). Остальные маршруты приложения сохраняют единый контракт `{"error": "<текст>"}` и коды `400/401/403/404/409`.

## Структуры данных

| Тип | Поля | Файл:строки |
| --- | --- | --- |
| `PublicUser` (ответы клиенту) | `id`, `fullName`, `email`, `birthDate`, `department`, `avatarUrl`, `role` — **без** `googleSub` | `lib/types.ts:18-21` |
| `User` (внутренняя модель) | `PublicUser` + `googleSub` | `lib/types.ts:5-16` |
| `Wish` | `id`, `authorEmail`, `targetUserId`, `text`, `createdAt` | `lib/types.ts:23-29` |
| `Donation` (только `admin`) | `userId`, `totalAmount`, `giftSent` | `lib/types.ts:31-35` |
| `DonationHistoryEntry` (только `admin`) | `id`, `userId`, `adminEmail`, `previousAmount`, `newAmount`, `reason`, `comment`, `createdAt` | `lib/types.ts:39-48` |
| `declinedUserIds` (для `employee`) | массив `id` получателей, отказавшихся от подарка | `app/api/donations/route.ts:29` |
| `ChatMessage` | `id`, `authorEmail`, `text`, `isAdmin`, `createdAt`, `readByAdmin` | `lib/types.ts:50-57` |
| `ChatThread` | `userEmail`, `messages` | `lib/types.ts:59-62` |

## Служебные значения

| Поле | Допустимые значения |
| --- | --- |
| `PublicUser.role` | `employee`, `admin` |
| `DonationHistoryEntry.reason` | `refund_declined`, `emergency_refund` |
| Сумма участия `amount` | целое число от `1` до `1 000 000` |
| Сумма сбора `Donation.totalAmount` | целое число не меньше нуля; при накоплении не выше `1 000 000 000` |
| `Wish.createdAt`, `ChatMessage.createdAt`, `DonationHistoryEntry.createdAt` | ISO-8601 строка |
| `ChatMessage.readByAdmin` | `true`, `false` |

Суммы сбора и журнал изменений доступны только роли `admin`. Ответ сотрудника на `GET /api/donations` — только `{"declinedUserIds": [...]}`; ответ сотрудника на `POST /api/donations` — только `{"wish": ...}` без суммы.

## Проверка контрактов через командную строку

Сессия в `HttpOnly`-cookie, подписанной сервером, поэтому вручную подставить адрес (`-b "corp-gift-auth-email=..."`) нельзя: запрос будет неаутентифицирован. Для проверок с сессией возьмите значение cookie `next-auth.session-token` (в продакшене — `__Secure-next-auth.session-token`) из DevTools после входа через браузер.

| Проверка | Команда (на сервере) |
| --- | --- |
| Справочник без сессии | `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/users` |
| Старая cookie не аутентифицирует | `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/users -b "corp-gift-auth-email=anna.smirnova@company.com"` |
| Регистрация без ticket и сессии | `curl -s -X POST http://127.0.0.1:3000/api/auth/register -H "Content-Type: application/json" -d '{"fullName":"X","birthDate":"1990-01-01","department":"Y"}'` |
| Чужой origin отклонён | `curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:3000/api/wishes -H "Origin: https://evil.example.com" -H "Content-Type: application/json" -d '{"targetUserId":"u1","text":"x"}'` |
| Сборы и журнал с сессией администратора | `curl -s http://127.0.0.1:3000/api/donations -b "next-auth.session-token=<значение>"` |
| Сборы с сессией сотрудника | `curl -s http://127.0.0.1:3000/api/donations -b "next-auth.session-token=<значение>"` — ответ `{"declinedUserIds":[...]}` |

## Ожидаемые коды для типовых негативных сценариев

| Сценарий | Ожидаемый код |
| --- | --- |
| Запрос без cookie сессии | `401` |
| Регистрация без действующего ticket или без совпадающей сессии | `401` |
| Регистрация с неполным профилем | `400` |
| Сотрудник выполняет админскую операцию | `403` |
| Мутирующий запрос с чужого origin | `403` |
| Сотрудник обращается к чужой ветке переписки | `403` |
| Некорректное тело запроса | `400` |
| Некорректный идентификатор ветки переписки | `400` |
| Участие себе, для прошедшего день рождения или для отказавшегося | `400` |
| Сумма участия больше максимума | `400` |
| Несуществующий получатель, сотрудник или пожелание | `404` |
| Повторное изменение сбора с оформленным отказом от подарка | `409` |
| Вход без подтверждённого Google адреса | редирект на `/login?error=AccessDenied`, сессия не создаётся |
| Вход с subject, не совпадающим с сохранённой записью | вход отклонён, сессия не создаётся |
