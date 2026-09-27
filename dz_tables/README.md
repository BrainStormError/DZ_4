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
| Демо-сотрудник | `anna.smirnova@company.com` |
| Демо-администратор | `alexander.petrov@company.com` |
| Cookie сессии | `corp-gift-auth-email` (`lib/auth-cookie.ts:1`) |
| Домен входа | `@company.com` (`lib/corp-email.ts:1`) |
