# Форматы ответов API

Все успешные и неуспешные ответы — JSON. Ошибки единообразны: `{"error": "<текст>"}`.

## Успешные ответы

| № | Endpoint | Код | Тело ответа | Тип |
| --- | --- | --- | --- | --- |
| 1 | `POST /api/auth/login` | `200` | `{ok:true, user}` | объект |
| 2 | `POST /api/auth/verify-email` | `200` | `{ok:true, user}` | объект |
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

Особые случаи успешного ответа с признаком неуспеха внутри:

| Endpoint | Код | Тело | Когда |
| --- | --- | --- | --- |
| `POST /api/auth/login` | `200` | `{ok:false, error}` | домен не корпоративный или адрес не найден |
| `POST /api/auth/verify-email` | `200` | `{ok:false, error}` | домен не корпоративный или адрес не найден |

## Структуры данных

| Тип | Поля | Файл:строки |
| --- | --- | --- |
| `User` | `id`, `fullName`, `email`, `birthDate`, `department`, `avatarUrl`, `role` | `lib/types.ts:5-13` |
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

| Проверка | Команда (на сервере) |
| --- | --- |
| Вход | `curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"anna.smirnova@company.com"}'` |
| Вход несуществующего адреса | `curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"no.such@company.com"}'` |
| Справочник без сессии | `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/users` |
| Справочник с сессией сотрудника | `curl -s http://localhost:3000/api/users -b "corp-gift-auth-email=anna.smirnova@company.com"` |
| Пожелания | `curl -s http://localhost:3000/api/wishes -b "corp-gift-auth-email=anna.smirnova@company.com"` |
| Сборы и журнал | `curl -s http://localhost:3000/api/donations -b "corp-gift-auth-email=anna.smirnova@company.com"` |
| Переписка сотрудника (только своя ветка) | `curl -s http://localhost:3000/api/chats -b "corp-gift-auth-email=anna.smirnova@company.com"` |
| Переписка администратора (все ветки) | `curl -s http://localhost:3000/api/chats -b "corp-gift-auth-email=alexander.petrov@company.com"` |
| Изменение суммы не-администратором (ожидается `403`) | `curl -s -X PATCH http://localhost:3000/api/donations/u2 -H "Content-Type: application/json" -b "corp-gift-auth-email=anna.smirnova@company.com" -d '{"newAmount":0,"reason":"refund_declined","comment":"test"}'` |
| Чужая переписка (ожидается `403`) | `curl -s -X POST "http://localhost:3000/api/chats/dmitry.volkov%40company.com/messages" -H "Content-Type: application/json" -b "corp-gift-auth-email=anna.smirnova@company.com" -d '{"text":"test"}'` |

## Ожидаемые коды для типовых негативных сценариев

| Сценарий | Ожидаемый код |
| --- | --- |
| Запрос без cookie сессии | `401` |
| Сотрудник выполняет админскую операцию | `403` |
| Сотрудник обращается к чужой ветке переписки | `403` |
| Некорректное тело запроса | `400` |
| Несуществующий получатель, сотрудник или пожелание | `404` |
| Повторное изменение сбора с оформленным отказом от подарка | `409` |
| Некорпоративный домен при входе | `200` с `ok:false` |
