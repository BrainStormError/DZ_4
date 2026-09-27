# Реестр реализованных API

Все маршруты — Route Handlers Next.js в каталоге `app/api`. Клиент не обращается к PostgreSQL напрямую: каждый обработчик идёт через `lib/repository.ts`.

## Сводная таблица

| № | Метод и путь | Доступ | Файл |
| --- | --- | --- | --- |
| 1 | `POST /api/auth/login` | публичный | `app/api/auth/login/route.ts` |
| 2 | `POST /api/auth/verify-email` | публичный | `app/api/auth/verify-email/route.ts` |
| 3 | `GET /api/users` | любой авторизованный | `app/api/users/route.ts` |
| 4 | `GET /api/wishes` | любой авторизованный | `app/api/wishes/route.ts` |
| 5 | `POST /api/wishes` | любой авторизованный | `app/api/wishes/route.ts` |
| 6 | `PATCH /api/wishes/[id]` | только `admin` | `app/api/wishes/[id]/route.ts` |
| 7 | `GET /api/donations` | любой авторизованный | `app/api/donations/route.ts` |
| 8 | `POST /api/donations` | любой авторизованный | `app/api/donations/route.ts` |
| 9 | `PATCH /api/donations/[id]` | только `admin` | `app/api/donations/[id]/route.ts` |
| 10 | `PATCH /api/donations/[id]/gift-status` | только `admin` | `app/api/donations/[id]/gift-status/route.ts` |
| 11 | `GET /api/chats` | любой авторизованный, с фильтрацией по роли | `app/api/chats/route.ts` |
| 12 | `POST /api/chats/[userEmail]/messages` | любой авторизованный, с проверкой владения веткой | `app/api/chats/[userEmail]/messages/route.ts` |
| 13 | `POST /api/chats/[userEmail]/read` | только `admin` | `app/api/chats/[userEmail]/read/route.ts` |

Итого: 13 маршрутов, 9 файлов обработчиков, 5 ресурсных групп (auth, users, wishes, donations, chats).

## Детализация по маршрутам

| № | Метод и путь | Тело запроса | Успешный ответ | Коды ошибок |
| --- | --- | --- | --- | --- |
| 1 | `POST /api/auth/login` | `{"email":"..."}` | `200` `{ok:true, user}` | `400` |
| 2 | `POST /api/auth/verify-email` | `{"email":"..."}` | `200` `{ok:true, user}` | `400` |
| 3 | `GET /api/users` | — | `200` `User[]` | `401` |
| 4 | `GET /api/wishes` | — | `200` `Wish[]` | `401` |
| 5 | `POST /api/wishes` | `{"targetUserId":"...","text":"..."}` | `201` `Wish` | `400`, `401`, `404` |
| 6 | `PATCH /api/wishes/[id]` | `{"text":"..."}` | `200` `Wish` | `400`, `401`, `403`, `404` |
| 7 | `GET /api/donations` | — | `200` `{donations, history}` | `401` |
| 8 | `POST /api/donations` | `{"userId":"...","amount":1000,"wishText":"..."}` | `201` `{donation, wish}` | `400`, `401`, `404` |
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
| `[userEmail]` | маршруты 12, 13 | email владельца ветки переписки, нормализуется через `decodeURIComponent` и `toLowerCase` |

## Откуда берётся авторство

| Действие | Источник идентификации | Файл:строка |
| --- | --- | --- |
| Создание пожелания | `authorId: user.id` из сессии | `app/api/wishes/route.ts:29` |
| Участие в сборе | `authorId: user.id` из сессии | `app/api/donations/route.ts:46` |
| Запись в журнал возвратов | `adminId: user.id`, `adminEmail: user.email` из сессии | `app/api/donations/[id]/route.ts:57-58` |
| Отправка сообщения | `authorId: user.id`, `isAdmin` из роли сессии | `app/api/chats/[userEmail]/messages/route.ts:28-33` |

Ни в одном обработчике авторство или роль не принимается из тела запроса — подделка авторства невозможна на уровне контракта API.
