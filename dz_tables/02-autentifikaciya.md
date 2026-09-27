# Аутентификация пользователей

Пароля нет. Вход выполняется по адресу корпоративной почты, который должен существовать в справочнике `users`.

## Ответы `POST /api/auth/login`

| Ситуация | Код | Тело ответа |
| --- | --- | --- |
| Тело запроса не содержит `email` | `400` | `{"error":"Некорректный запрос"}` |
| Домен не `@company.com` | `200` | `{"ok":false,"error":"Используйте корпоративную почту @company.com"}` |
| Адрес не найден в справочнике | `200` | `{"ok":false,"error":"Сотрудник не найден. Проверьте адрес почты."}` |
| Успешный вход | `200` | `{"ok":true,"user":{...}}` |
| Тело не является валидным JSON | `400` | `{"error":"Некорректный запрос"}` |

Признак неуспеха передаётся полем `ok:false`, а не HTTP-кодом: неуспешный вход отвечает `200`.

## Шаги входа

| Шаг | Действие | Файл:строки |
| --- | --- | --- |
| 1 | Разбор тела, проверка наличия строкового `email` | `app/api/auth/login/route.ts:9-12` |
| 2 | Нормализация: `trim()` и `toLowerCase()` | `app/api/auth/login/route.ts:14` |
| 3 | Проверка домена `@company.com` | `app/api/auth/login/route.ts:15-18`, `lib/corp-email.ts:12-17` |
| 4 | Поиск сотрудника в таблице `users` | `app/api/auth/login/route.ts:20`, `lib/repository.ts:49-55` |
| 5 | Ответ `{ok:true, user}` | `app/api/auth/login/route.ts:28` |
| 6 | Запись cookie на клиенте | `lib/auth-context.tsx:46`, `lib/auth-cookie.ts:3-6` |
| 7 | Переход на главную страницу | `app/(auth)/login/LoginForm.tsx:27` |

## Атрибуты cookie сессии

Cookie ставится клиентским JavaScript, а не заголовком `Set-Cookie` от сервера.

| Атрибут | Значение | Источник |
| --- | --- | --- |
| Имя | `corp-gift-auth-email` | `lib/auth-cookie.ts:1` |
| Значение | email пользователя | `lib/auth-cookie.ts:5` |
| `Path` | `/` | `lib/auth-cookie.ts:5` |
| `SameSite` | `Lax` | `lib/auth-cookie.ts:5` |
| `HttpOnly` | нет | `lib/auth-cookie.ts:5` |
| `Secure` | нет | `lib/auth-cookie.ts:5` |
| Криптографическая подпись | нет | `lib/auth-cookie.ts:5` |
| Срок жизни | сессия браузера (без `Max-Age` и `Expires`) | `lib/auth-cookie.ts:5` |

Сервер не хранит состояние сессии: никаких таблиц сессий и токенов нет.

## Разрешение пользователя на сервере

Единая точка — функция `resolveCurrentUser()` в `lib/session.ts:6-18`.

| Шаг | Действие | Файл:строки |
| --- | --- | --- |
| 1 | Чтение cookie `corp-gift-auth-email` | `lib/session.ts:7` |
| 2 | Если cookie нет — вернуть `null` | `lib/session.ts:8` |
| 3 | Декодирование значения `decodeURIComponent` | `lib/session.ts:10-15` |
| 4 | Поиск пользователя в справочнике по email | `lib/session.ts:17`, `lib/repository.ts:49-55` |
| 5 | Вернуть объект `User` (включая `id` и `role`) либо `null` | `lib/session.ts:17` |

Следствия:

| Ситуация | Результат |
| --- | --- |
| Cookie отсутствует | `null`: API отвечают `401`, страницы уводят на `/login` |
| Cookie указывает на несуществующего пользователя | `null`: доступ отзывается автоматически без отдельного списка сессий |
| Cookie указывает на существующего пользователя | Работает как валидная сессия с его ролью |
| Cookie подставлена вручную (значение не подписано) | Работает как валидная сессия: подлинность не проверяется |

## Выход из системы

| Действие | Файл:строки |
| --- | --- |
| Сброс состояния `user` в React | `lib/auth-context.tsx:55` |
| Очистка cookie (`Max-Age=0`) | `lib/auth-context.tsx:56`, `lib/auth-cookie.ts:8-11` |
| Удаление устаревшего ключа `corp-gift-auth-email` из `localStorage` | `lib/auth-context.tsx:17-19,57` |

Серверных действий при выходе нет: список отозванных сессий не ведётся.

## Дублирующий маршрут

| Маршрут | Отличие от `POST /api/auth/login` |
| --- | --- |
| `POST /api/auth/verify-email` | Отличий нет: код обработчика идентичен, клиент его не вызывает |

Файл `app/api/auth/verify-email/route.ts` содержит ту же логику, что и `app/api/auth/login/route.ts`. В `lib/auth-context.tsx` вызывается только `/api/auth/login`.
