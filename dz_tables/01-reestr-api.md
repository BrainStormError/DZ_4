# Реестр реализованных API

Все маршруты — Route Handlers Next.js в каталоге `app/api`. Клиент не обращается к PostgreSQL напрямую: каждый обработчик идёт через `lib/repository.ts`.

## Сводная таблица

| № | Метод и путь | Доступ | Файл |
| --- | --- | --- | --- |
| 1 | `GET/POST /api/auth/[...nextauth]` | публичный | `app/api/auth/[...nextauth]/route.ts` |
| 2 | `POST /api/auth/register` | по ticket регистрации и unregistered-сессии | `app/api/auth/register/route.ts` |
| 3 | `GET /api/users` | любой авторизованный | `app/api/users/route.ts` |
| 4 | `GET /api/wishes` | любой авторизованный | `app/api/wishes/route.ts` |
| 5 | `POST /api/wishes` | любой авторизованный | `app/api/wishes/route.ts` |
| 6 | `PATCH /api/wishes/[id]` | только `admin` | `app/api/wishes/[id]/route.ts` |
| 7 | `GET /api/donations` | любой авторизованный, форма ответа по роли | `app/api/donations/route.ts` |
| 8 | `POST /api/donations` | любой авторизованный | `app/api/donations/route.ts` |
| 9 | `PATCH /api/donations/[id]` | только `admin` | `app/api/donations/[id]/route.ts` |
| 10 | `PATCH /api/donations/[id]/gift-status` | только `admin` | `app/api/donations/[id]/gift-status/route.ts` |
| 11 | `GET /api/chats` | любой авторизованный, с фильтрацией по роли | `app/api/chats/route.ts` |
| 12 | `POST /api/chats/[userEmail]/messages` | любой авторизованный, с проверкой владения веткой | `app/api/chats/[userEmail]/messages/route.ts` |
| 13 | `POST /api/chats/[userEmail]/read` | только `admin` | `app/api/chats/[userEmail]/read/route.ts` |

Итого: 13 маршрутов, 9 файлов обработчиков, 5 ресурсных групп (auth, users, wishes, donations, chats). Все обработчики, кроме маршрута NextAuth и завершения регистрации, требуют действующей сессии. Каждый мутирующий запрос (`POST`/`PATCH`) дополнительно проверяет источник (`Origin`/`Sec-Fetch-Site`) и при чужом источнике отвечает `403`.

## Детализация по маршрутам

| № | Метод и путь | Тело запроса | Успешный ответ | Коды ошибок |
| --- | --- | --- | --- | --- |
| 1 | `GET/POST /api/auth/[...nextauth]` | — (OAuth-редиректы и формы NextAuth) | `200` (сессия, JSON или редирект) | `400`, `401`, `403` |
| 2 | `POST /api/auth/register` | `{"fullName":"...","birthDate":"YYYY-MM-DD","department":"..."}` | `201` `{user}` | `400`, `401` |
| 3 | `GET /api/users` | — | `200` `User[]` (проекция без `googleSub`) | `401` |
| 4 | `GET /api/wishes` | — | `200` `Wish[]` | `401` |
| 5 | `POST /api/wishes` | `{"targetUserId":"...","text":"..."}` | `201` `Wish` | `400`, `401`, `403`, `404` |
| 6 | `PATCH /api/wishes/[id]` | `{"text":"..."}` | `200` `Wish` | `400`, `401`, `403`, `404` |
| 7 | `GET /api/donations` | — | `200` `admin`: `{donations, history}`; `employee`: `{declinedUserIds}` | `401` |
| 8 | `POST /api/donations` | `{"userId":"...","amount":1000,"wishText":"..."}` | `201` `admin`: `{donation, wish}`; `employee`: `{wish}` | `400`, `401`, `403`, `404` |
| 9 | `PATCH /api/donations/[id]` | `{"newAmount":0,"reason":"...","comment":"..."}` | `200` `{donation, entry}` | `400`, `401`, `403`, `404`, `409` |
| 10 | `PATCH /api/donations/[id]/gift-status` | `{"sent":true}` | `200` `Donation` | `400`, `401`, `403`, `404`, `409` |
| 11 | `GET /api/chats` | — | `200` `ChatThread[]` | `401` |
| 12 | `POST /api/chats/[userEmail]/messages` | `{"text":"..."}` | `201` `ChatMessage` | `400`, `401`, `403`, `404` |
| 13 | `POST /api/chats/[userEmail]/read` | — | `200` `ChatThread` | `401`, `403`, `404` |

## Смысл параметров пути

| Параметр | Где встречается | Что означает |
| --- | --- | --- |
| `[id]` в `/api/wishes/[id]` | маршрут 6 | идентификатор пожелания (`wishes.id`, вид `w<uuid>`) |
| `[id]` в `/api/donations/[id]` | маршрут 9 | идентификатор **сотрудника** (`users.id`, вид `u2`), а не записи о сборе |
| `[id]` в `/api/donations/[id]/gift-status` | маршрут 10 | идентификатор **сотрудника** (`users.id`) |
| `[userEmail]` | маршруты 12, 13 | email владельца ветки переписки, декодируется защитно через `decodeThreadEmail` и `toLowerCase`; некорректная кодировка → `400` |

## Откуда берётся авторство

| Действие | Источник идентификации | Файл:строка |
| --- | --- | --- |
| Создание пожелания | `authorId: user.id` из сессии | `app/api/wishes/route.ts:29` |
| Участие в сборе | `authorId: user.id` из сессии | `app/api/donations/route.ts:46` |
| Запись в журнал возвратов | `adminId: user.id`, `adminEmail: user.email` из сессии | `app/api/donations/[id]/route.ts:57-58` |
| Отправка сообщения | `authorId: user.id`, `isAdmin` из роли сессии | `app/api/chats/[userEmail]/messages/route.ts:28-33` |

Ни в одном обработчике авторство или роль не принимается из тела запроса — подделка авторства невозможна на уровне контракта API.
