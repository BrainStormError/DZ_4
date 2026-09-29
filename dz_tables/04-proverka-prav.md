# Проверка прав пользователей

Все проверки выполняются на сервере, в начале обработчика, до обращения к репозиторию. Клиентские проверки носят вспомогательный характер и защитой не являются.

## Единый шаблон проверки

| Шаг | Что проверяется | Ответ при отказе |
| --- | --- | --- |
| 1 | Аутентификация: `resolveCurrentUser()` вернул пользователя | `401` `{"error":"Требуется вход в систему"}` |
| 2 | Авторизация: роль соответствует операции | `403` `{"error":"Действие доступно только администратору"}` |
| 3 | Владение ресурсом (только для переписки) | `403` `{"error":"Доступ к чужой переписке запрещён"}` |

## Точки проверки в API

| Файл | Строки | Что проверяется |
| --- | --- | --- |
| `app/api/users/route.ts` | 8-9 | `401` без сессии |
| `app/api/wishes/route.ts` | 9-10 | `401` в `GET` |
| `app/api/wishes/route.ts` | 16-17 | `401` в `POST` |
| `app/api/wishes/[id]/route.ts` | 12-16 | `401`, затем `403` для не-администратора |
| `app/api/donations/route.ts` | 14-15 | `401` в `GET` |
| `app/api/donations/route.ts` | 25-26 | `401` в `POST` |
| `app/api/donations/[id]/route.ts` | 19-23 | `401`, затем `403` для не-администратора |
| `app/api/donations/[id]/gift-status/route.ts` | 12-16 | `401`, затем `403` для не-администратора |
| `app/api/chats/route.ts` | 9-16 | `401`, затем выбор выборки по роли |
| `app/api/chats/[userEmail]/messages/route.ts` | 12-19 | `401`, затем владение веткой: `403` при чужом `userEmail` |
| `app/api/chats/[userEmail]/read/route.ts` | 12-16 | `401`, затем `403` для не-администратора |
| `app/api/auth/[...nextauth]/route.ts` | — | вход, callback и выход обрабатывает NextAuth; собственных проверок прав нет |
| `app/api/auth/register/route.ts` | 36-38, 54-56 | `401` без действующего ticket регистрации; `400` при неполном профиле |

## Точки проверки на уровне страниц

| Файл | Строки | Что проверяется | Результат отказа |
| --- | --- | --- | --- |
| `app/(app)/layout.tsx` | 8-12 | наличие разрешённого пользователя для всех защищённых страниц | `redirect('/login')` |
| `app/(app)/admin/page.tsx` | 6-11 | роль `admin` | рендерится `AdminAccessDenied` вместо `AdminTable` |

## Коды ошибок

| Код | Смысл | Пример сообщения | Где возникает |
| --- | --- | --- | --- |
| `400` | Некорректный запрос: тело не разобралось или не прошло валидацию | «Некорректный запрос» | все обработчики с телом |
| `401` | Пользователь не аутентифицирован | «Требуется вход в систему» | все защищённые маршруты |
| `403` | Аутентифицирован, но нет прав на операцию | «Действие доступно только администратору» | маршруты 6, 9, 10, 13 |
| `403` | Нарушено владение веткой переписки | «Доступ к чужой переписке запрещён» | маршрут 12 |
| `404` | Цель операции не найдена | «Получатель не найден», «Сотрудник не найден», «Пожелание не найдено», «Сбор не найден» | маршруты 5, 6, 8, 9, 10, 12, 13 |
| `409` | Бизнес-конфликт: по сбору уже оформлен отказ от подарка | «Изменение суммы недоступно: подарок возвращён» | маршруты 9, 10 |

## Валидации `PATCH /api/donations/[id]`

Проверки выполняются по порядку, первая сработавшая возвращает соответствующий код.

| № | Проверка | Код | Файл:строки |
| --- | --- | --- | --- |
| 1 | Тело запроса не разобралось | `400` | `app/api/donations/[id]/route.ts:30` |
| 2 | `reason` не из `refund_declined` / `emergency_refund` | `400` | `app/api/donations/[id]/route.ts:35-37` |
| 3 | `comment` пустой | `400` | `app/api/donations/[id]/route.ts:38-40` |
| 4 | `newAmount` не целое неотрицательное число | `400` | `app/api/donations/[id]/route.ts:41-43` |
| 5 | `reason = refund_declined` и `newAmount` не равен нулю | `400` | `app/api/donations/[id]/route.ts:44-46` |
| 6 | Сотрудник не найден | `404` | `app/api/donations/[id]/route.ts:48-49` |
| 7 | Ранее уже был отказ от подарка | `409` | `app/api/donations/[id]/route.ts:51-53` |
| 8 | Сбор не найден | `404` | `app/api/donations/[id]/route.ts:63` |

## Валидации остальных маршрутов с телом

| Маршрут | Проверка | Код | Файл:строки |
| --- | --- | --- | --- |
| `POST /api/wishes` | нет `targetUserId` или пустой `text` | `400` | `app/api/wishes/route.ts:22-24` |
| `POST /api/wishes` | получатель не найден | `404` | `app/api/wishes/route.ts:26-27` |
| `PATCH /api/wishes/[id]` | пустой `text` | `400` | `app/api/wishes/[id]/route.ts:18-20` |
| `PATCH /api/wishes/[id]` | пожелание не найдено | `404` | `app/api/wishes/[id]/route.ts:23` |
| `POST /api/donations` | не передан `userId` | `400` | `app/api/donations/route.ts:33-34` |
| `POST /api/donations` | `amount` не целое положительное | `400` | `app/api/donations/route.ts:35-37` |
| `POST /api/donations` | получатель не найден | `404` | `app/api/donations/route.ts:39-40` |
| `PATCH /api/donations/[id]/gift-status` | `sent` не boolean | `400` | `app/api/donations/[id]/gift-status/route.ts:19-21` |
| `PATCH /api/donations/[id]/gift-status` | сотрудник не найден | `404` | `app/api/donations/[id]/gift-status/route.ts:23-24` |
| `PATCH /api/donations/[id]/gift-status` | ранее был отказ от подарка | `409` | `app/api/donations/[id]/gift-status/route.ts:26-28` |
| `POST /api/chats/[userEmail]/messages` | пустой `text` | `400` | `app/api/chats/[userEmail]/messages/route.ts:26` |
| `POST /api/chats/[userEmail]/messages` | ветка-сотрудник не найден | `404` | `app/api/chats/[userEmail]/messages/route.ts:21-22` |
| `POST /api/auth/register` | нет или просрочен ticket регистрации | `401` | `app/api/auth/register/route.ts:36-38` |
| `POST /api/auth/register` | пустое имя, некорректная дата или пустой отдел | `400` | `app/api/auth/register/route.ts:49-56` |

## Вспомогательные функции валидации

| Функция | Назначение | Файл:строки |
| --- | --- | --- |
| `errorResponse(message, status)` | единый формат ошибки `{"error": "..."}` | `lib/api.ts:3-5` |
| `parseJsonBody(request)` | безопасный разбор JSON, возвращает `null` при ошибке | `lib/api.ts:7-13` |
| `isPositiveInt(value)` | проверка целого числа больше нуля | `lib/api.ts:15-17` |
| `isNonNegativeInt(value)` | проверка целого числа не меньше нуля | `lib/api.ts:19-21` |
| `readRegistrationTicket(raw)` | проверка подписи и срока ticket регистрации | `lib/registration-ticket.ts` |
| `createEmployeeUser(input)` | создание сотрудника с фиксированной ролью `employee` | `lib/repository.ts` |

## Контроль конкурентного доступа

| Механизм | Назначение | Файл:строки |
| --- | --- | --- |
| `withTransaction(fn)` | атомарность составных операций | `lib/db.ts:30-45` |
| `SELECT ... FOR UPDATE` | блокировка строки сбора при изменении суммы | `lib/repository.ts:248` |
| `INSERT ... ON CONFLICT DO UPDATE SET total_amount = total_amount + EXCLUDED.total_amount` | атомарное накопление суммы участия | `lib/repository.ts:157-162` |

## Ограничения текущей модели

| № | Ограничение | Причина |
| --- | --- | --- |
| 1 | Сессия не отзывается мгновенно на уровне cookie | Токен подписан; отзыв доступа обеспечивается сверкой записи в БД на каждом серверном рендере |
| 2 | Отсутствует проверка CSRF на собственных мутирующих запросах | Часть запросов защищена `SameSite=Lax`; маршрут NextAuth имеет собственную CSRF-защиту |
| 3 | Отсутствует ограничение частоты попыток входа | Нет rate limiting на callback входа Google |
| 4 | Журнал возвратов доступен всем авторизованным | `GET /api/donations` не фильтрует `history` по роли |
| 5 | Нет пагинации выборок | `listUsers`, `listWishes`, `listDonationHistory`, `listChatThreads` возвращают полные наборы |
| 6 | Отметка «подарок вручён» не пишется в журнал | `setGiftSent()` в отличие от `updateDonationAmount()` не создаёт запись в `donation_history` |
| 7 | Параметр `[id]` в маршрутах сбора означает id сотрудника | Совпадает с моделью данных, но название параметра не отражает смысл |
| 8 | Нет журнала чтения | Аудит ведётся только по изменениям сумм в `donation_history` |
