# Таблицы проекта «Корподарки»

Справочные таблицы по реализованным API, аутентификации пользователей, политике доступа к данным и проверке прав.

## Состав

| Файл | Содержание |
| --- | --- |
| [01-reestr-api.md](01-reestr-api.md) | Реестр реализованных API: метод, путь, уровень доступа, файл |
| [02-autentifikaciya.md](02-autentifikaciya.md) | Вход, атрибуты cookie, разрешение пользователя, выход |
| [03-matrica-dostupa.md](03-matrica-dostupa.md) | Матрица доступа по ролям `employee` / `admin` |
| [04-proverka-prav.md](04-proverka-prav.md) | Точки проверки прав, коды ошибок, валидации, ограничения БД |
| [05-formaty-otvetov.md](05-formaty-otvetov.md) | Форматы успешных ответов и примеры проверки |

## Входные данные

| Параметр | Значение |
| --- | --- |
| Роли | `employee`, `admin` (enum `user_role`, `db/init/001_schema.sql:7`) |
| Вход | Google OAuth 2.0, провайдер NextAuth v4 (`lib/auth-options.ts`) |
| Cookie сессии | `next-auth.session-token`, подписана и `HttpOnly` (`lib/auth-options.ts`) |
| Администратор | назначается вручную в БД (`UPDATE users SET role = 'admin' ...`) |
| Демо-записи | `anna.smirnova@company.com`, `alexander.petrov@company.com` — данные для получателей, но войти под ними нельзя (нет Google-аккаунта) |
