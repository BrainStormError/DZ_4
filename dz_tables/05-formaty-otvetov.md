# Форматы ответов API

Все успешные и неуспешные ответы — JSON. Ошибки единообразны: `{"error": "<текст>"}`.

## Успешные ответы

| № | Endpoint | Код | Тело ответа | Тип |
| --- | --- | --- | --- | --- |
| 1 | `GET/POST /api/auth/[...nextauth]` | — | ответы в формате NextAuth: сессия, редирект на Google или на `/login` | разное |
| 2 | `POST /api/auth/register` | `201` | `{user}` | объект |
| 3 | `GET /api/users` | `200` | `User[]` | массив |
| 4 | `GET /api/wishes` | `200` | `Wish[]` | массив |
| 5 | `POST /api/wishes` | `201` | `Wish` | объект |
| 6 | `PATCH /api/wishes/[id]` | `200` | `Wish` | объект |
| 7 | `GET /api/donations` | `200` | `{donations, history}` | объект с двумя массивами |
| 8 | `POST /api/donations` | `201` | `{donation, wish}` | объект, `wish` может быть `null` |
| 9 | `PATCH /api/donations/[id]` | `200` | `{donation, entry}` | объект |
| 10 | `PATCH /api/donations/[id]/gift-status` | `200` | `Donation` | объект |
| 11 | `GET /api/chats` | `200` | `ChatThread[]` | массив |
| 12 | `POST /api/chats/[userEmail]/messages` | `201` | `ChatMessage` | объект |
| 13 | `POST /api/chats/[userEmail]/read` | `200` | `ChatThread` | объект |

Особый случай: маршрут NextAuth `GET/POST /api/auth/[...nextauth]` отвечает в собственном формате (JSON-сессия, редирект на Google, редирект на `/login?error=...`). Остальные маршруты приложения сохраняют единый контракт `{"error": "<текст>"}` и коды `400/401/403/404/409`.

## Структуры данных

| Тип | Поля | Файл:строки |
| --- | --- | --- |
| `User` | `id`, `fullName`, `email`, `googleSub`, `birthDate`, `department`, `avatarUrl`, `role` | `lib/types.ts` |
| `Wish` | `id`, `authorEmail`, `targetUserId`, `text`, `createdAt` | `lib/types.ts:15-21` |
| `Donation` | `userId`, `totalAmount`, `giftSent` | `lib/types.ts:23-27` |
| `DonationHistoryEntry` | `id`, `userId`, `adminEmail`, `previousAmount`, `newAmount`, `reason`, `comment`, `createdAt` | `lib/types.ts:31-40` |
| `ChatMessage` | `id`, `authorEmail`, `text`, `isAdmin`, `createdAt`, `readByAdmin` | `lib/types.ts:42-49` |
| `ChatThread` | `userEmail`, `messages` | `lib/types.ts:51-54` |

## Служебные значения

| Поле | Допустимые значения |
| --- | --- |
| `User.role` | `employee`, `admin` |
| `DonationHistoryEntry.reason` | `refund_declined`, `emergency_refund` |
| `Donation.totalAmount` | целое число не меньше нуля |
| `Wish.createdAt`, `ChatMessage.createdAt`, `DonationHistoryEntry.createdAt` | ISO-8601 строка |
| `ChatMessage.readByAdmin` | `true`, `false` |

## Проверка контрактов через командную строку

Сессия теперь в `HttpOnly`-cookie, подписанной сервером, поэтому вручную подставить адрес (`-b "corp-gift-auth-email=..."`) больше нельзя: запрос будет неаутентифицирован. Для проверок с сессией возьмите значение cookie `next-auth.session-token` из DevTools после входа через браузер.

| Проверка | Команда (на сервере) |
| --- | --- |
| Справочник без сессии | `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/users` |
| Старая cookie не аутентифицирует | `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/users -b "corp-gift-auth-email=anna.smirnova@company.com"` |
| Регистрация без ticket | `curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"fullName":"X","birthDate":"1990-01-01","department":"Y"}'` |
| Справочник с сессией (подставить cookie из браузера) | `curl -s http://localhost:3000/api/users -b "next-auth.session-token=<значение>"` |
| Сборы и журнал с сессией | `curl -s http://localhost:3000/api/donations -b "next-auth.session-token=<значение>"` |

## Ожидаемые коды для типовых негативных сценариев

| Сценарий | Ожидаемый код |
| --- | --- |
| Запрос без cookie сессии | `401` |
| Регистрация без действующего ticket | `401` |
| Регистрация с неполным профилем | `400` |
| Сотрудник выполняет админскую операцию | `403` |
| Сотрудник обращается к чужой ветке переписки | `403` |
| Некорректное тело запроса | `400` |
| Несуществующий получатель, сотрудник или пожелание | `404` |
| Повторное изменение сбора с оформленным отказом от подарка | `409` |
| Вход без подтверждённого Google адреса | редирект на `/login?error=AccessDenied`, сессия не создаётся |
