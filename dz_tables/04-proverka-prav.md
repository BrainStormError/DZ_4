# Проверка прав пользователей

Все проверки выполняются на сервере, в начале обработчика, до обращения к репозиторию. Клиентские проверки носят вспомогательный характер и защитой не являются.

## Единый шаблон проверки

| Шаг | Что проверяется | Ответ при отказе |
| --- | --- | --- |
| 0 | Источник мутирующего запроса: `originGuard(request)` (только `POST`/`PATCH`) | `403` `{"error":"Запрос отклонён: недопустимый источник"}` |
| 1 | Аутентификация: `resolveCurrentUser()` вернул пользователя | `401` `{"error":"Требуется вход в систему"}` |
| 2 | Авторизация: роль соответствует операции | `403` `{"error":"Действие доступно только администратору"}` |
| 3 | Владение ресурсом (только для переписки) | `403` `{"error":"Доступ к чужой переписке запрещён"}` |

## Точки проверки в API

| Файл | Строки | Что проверяется |
| --- | --- | --- |
| `app/api/users/route.ts` | 9-10 | `401` без сессии |
| `app/api/wishes/route.ts` | 9-10 | `401` в `GET` |
| `app/api/wishes/route.ts` | 16, 19-20 | origin, затем `401` в `POST` |
| `app/api/wishes/[id]/route.ts` | 13, 16-18 | origin, `401`, затем `403` для не-администратора |
| `app/api/donations/route.ts` | 24-25, 28 | `401` в `GET`, затем выбор формы ответа по роли |
| `app/api/donations/route.ts` | 40, 43-44 | origin, затем `401` в `POST` |
| `app/api/donations/[id]/route.ts` | 20, 23-25 | origin, `401`, затем `403` для не-администратора |
| `app/api/donations/[id]/gift-status/route.ts` | 13, 16-18 | origin, `401`, затем `403` для не-администратора |
| `app/api/chats/route.ts` | 9-16 | `401`, затем выбор выборки по роли |
| `app/api/chats/[userEmail]/messages/route.ts` | 13, 16-17, 19, 24-28 | origin, `401`, декодирование идентификатора, владение веткой: `403` при чужом `userEmail` |
| `app/api/chats/[userEmail]/read/route.ts` | 13, 16-18, 26 | origin, `401`, затем `403` для не-администратора, декодирование идентификатора |
| `app/api/auth/[...nextauth]/route.ts` | — | вход, callback и выход обрабатывает NextAuth; собственных проверок прав нет |
| `app/api/auth/register/route.ts` | 32, 35-45, 62-64 | origin, `401` без действующего ticket **и** без совпадающей unregistered-сессии; `400` при неполном профиле |

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
| `403` | Чужой источник мутирующего запроса | «Запрос отклонён: недопустимый источник» | мутирующие маршруты |
| `403` | Аутентифицирован, но нет прав на операцию | «Действие доступно только администратору» | маршруты 6, 9, 10, 13 |
| `403` | Нарушено владение веткой переписки | «Доступ к чужой переписке запрещён» | маршрут 12 |
| `404` | Цель операции не найдена | «Получатель не найден», «Сотрудник не найден», «Пожелание не найдено», «Сбор не найден» | маршруты 5, 6, 8, 9, 10, 12, 13 |
| `409` | Бизнес-конфликт: по сбору уже оформлен отказ от подарка | «Изменение суммы недоступно: подарок возвращён» | маршруты 9, 10 |

## Валидации `PATCH /api/donations/[id]`

Проверки выполняются по порядку, первая сработавшая возвращает соответствующий код.

| № | Проверка | Код | Файл:строки |
| --- | --- | --- | --- |
| 0 | Чужой источник запроса | `403` | `app/api/donations/[id]/route.ts:20-21` |
| 1 | Тело запроса не разобралось | `400` | `app/api/donations/[id]/route.ts:32` |
| 2 | `reason` не из `refund_declined` / `emergency_refund` | `400` | `app/api/donations/[id]/route.ts:37-39` |
| 3 | `comment` пустой | `400` | `app/api/donations/[id]/route.ts:40-42` |
| 4 | `newAmount` не целое неотрицательное число | `400` | `app/api/donations/[id]/route.ts:43-45` |
| 5 | `reason = refund_declined` и `newAmount` не равен нулю | `400` | `app/api/donations/[id]/route.ts:46-48` |
| 6 | Сотрудник не найден | `404` | `app/api/donations/[id]/route.ts:50-51` |
| 7 | Ранее уже был отказ от подарка | `409` | `app/api/donations/[id]/route.ts:59-61` |
| 8 | Сбор не найден | `404` | `app/api/donations/[id]/route.ts:67` |

## Валидации остальных маршрутов с телом

| Маршрут | Проверка | Код | Файл:строки |
| --- | --- | --- | --- |
| `POST /api/wishes` | нет `targetUserId` или пустой `text` | `400` | `app/api/wishes/route.ts:24-27` |
| `POST /api/wishes` | получатель не найден | `404` | `app/api/wishes/route.ts:29-30` |
| `PATCH /api/wishes/[id]` | пустой `text` | `400` | `app/api/wishes/[id]/route.ts:28` |
| `PATCH /api/wishes/[id]` | пожелание не найдено | `404` | `app/api/wishes/[id]/route.ts:31` |
| `POST /api/donations` | не передан `userId` | `400` | `app/api/donations/route.ts:52` |
| `POST /api/donations` | `amount` не целое положительное или больше максимума | `400` | `app/api/donations/route.ts:53-58` |
| `POST /api/donations` | получатель не найден | `404` | `app/api/donations/route.ts:61` |
| `POST /api/donations` | получатель — сам вызывающий | `400` | `app/api/donations/route.ts:64-66` |
| `POST /api/donations` | день рождения получателя уже прошёл в этом году | `400` | `app/api/donations/route.ts:67-69` |
| `POST /api/donations` | получатель отказался от подарка | `400` | `app/api/donations/route.ts:70-72` |
| `POST /api/donations` | сумма превысила максимум сбора | `400` | `app/api/donations/route.ts:82-84` |
| `PATCH /api/donations/[id]/gift-status` | `sent` не boolean | `400` | `app/api/donations/[id]/gift-status/route.ts:24-26` |
| `PATCH /api/donations/[id]/gift-status` | сотрудник не найден | `404` | `app/api/donations/[id]/gift-status/route.ts:28-29` |
| `PATCH /api/donations/[id]/gift-status` | ранее был отказ от подарка | `409` | `app/api/donations/[id]/gift-status/route.ts:34-36` |
| `POST /api/chats/[userEmail]/messages` | некорректный идентификатор ветки | `400` | `app/api/chats/[userEmail]/messages/route.ts:19-21` |
| `POST /api/chats/[userEmail]/messages` | ветка-сотрудник не найден | `404` | `app/api/chats/[userEmail]/messages/route.ts:33-34` |
| `POST /api/chats/[userEmail]/messages` | пустой `text` | `400` | `app/api/chats/[userEmail]/messages/route.ts:37-38` |
| `POST /api/auth/register` | нет или просрочен ticket регистрации | `401` | `app/api/auth/register/route.ts:35-38` |
| `POST /api/auth/register` | нет unregistered-сессии или её адрес не совпадает с ticket | `401` | `app/api/auth/register/route.ts:43-45` |
| `POST /api/auth/register` | пустое имя, некорректная дата или пустой отдел | `400` | `app/api/auth/register/route.ts:57-64` |

## Вспомогательные функции валидации

| Функция | Назначение | Файл:строки |
| --- | --- | --- |
| `errorResponse(message, status)` | единый формат ошибки `{"error": "..."}` | `lib/api.ts:3-5` |
| `parseJsonBody(request)` | безопасный разбор JSON, возвращает `null` при ошибке | `lib/api.ts:7-13` |
| `isPositiveInt(value)` | проверка целого числа больше нуля | `lib/api.ts:15-17` |
| `isNonNegativeInt(value)` | проверка целого числа не меньше нуля | `lib/api.ts:19-21` |
| `MAX_PARTICIPATION_AMOUNT` | документированный максимум суммы участия (1 000 000) | `lib/api.ts:24` |
| `MAX_COLLECTION_TOTAL` | документированный максимум суммы сбора (1 000 000 000) | `lib/api.ts:31` |
| `isParticipationAmount(value)` | положительное целое в пределах максимума участия | `lib/api.ts:33-35` |
| `decodeThreadEmail(raw)` | защитное декодирование идентификатора ветки: `null` вместо исключения | `lib/api.ts:41-48` |
| `isTrustedOrigin(request)` / `originGuard(request)` | проверка источника мутирующего запроса | `lib/api.ts:59-87` |
| `readRegistrationTicket(raw)` | проверка подписи (отдельный секрет) и срока ticket | `lib/registration-ticket.ts` |
| `resolveSignInUser(email, sub)` | привязка identity к subject провайдера | `lib/identity.ts` |
| `createEmployeeUser(input)` | создание сотрудника с фиксированной ролью `employee`, conflict-safe | `lib/repository.ts:116-146` |
| `toPublicUser(user)` | проекция без `google_sub` для ответов клиенту | `lib/repository.ts:47-57` |

## Контроль конкурентного доступа

| Механизм | Назначение | Файл:строки |
| --- | --- | --- |
| `withTransaction(fn)` | атомарность составных операций | `lib/db.ts:30-45` |
| `SELECT ... FOR UPDATE` | блокировка строки сбора при изменении суммы | `lib/repository.ts:327-345` |
| `INSERT ... ON CONFLICT DO NOTHING` | атомарное создание записи при регистрации: ровно одна запись | `lib/repository.ts:116-146` |
| `INSERT ... ON CONFLICT DO UPDATE ... WHERE total <= $3` | атомарное накопление суммы с защитой от переполнения | `lib/repository.ts:234-268` |

## Ограничения текущей модели

| № | Ограничение | Причина |
| --- | --- | --- |
| 1 | Сессия не отзывается мгновенно на уровне cookie | Токен подписан; отзыв доступа обеспечивается сверкой записи в БД на каждом серверном рендере |
| 2 | Собственная CSRF-защита у мутирующих запросов ограничена | Добавлена проверка `Origin`/`Sec-Fetch-Site`; первым слоем остаётся `SameSite=Lax`, у маршрута NextAuth — собственная CSRF-защита |
| 3 | Отсутствует ограничение частоты попыток входа | Нет rate limiting на callback входа Google |
| 4 | Граница допуска открыта по замыслу | Любой подтверждённый Google аккаунт входит и регистрируется; для продакшена нужны дополнительные меры |
| 5 | Нет пагинации выборок | `listUsers`, `listWishes`, `listDonationHistory`, `listChatThreads` возвращают полные наборы |
| 6 | Отметка «подарок вручён» не пишется в журнал | `setGiftSent()` в отличие от `updateDonationAmount()` не создаёт запись в `donation_history` |
| 7 | Параметр `[id]` в маршрутах сбора означает id сотрудника | Совпадает с моделью данных, но название параметра не отражает смысл |
| 8 | Нет журнала чтения | Аудит ведётся по изменениям сумм и по структурным событиям безопасности (`lib/log.ts`) |
