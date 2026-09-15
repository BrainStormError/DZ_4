# Корподарки

Демо-приложение для добровольного сбора средств на подарки сотрудникам ко дню рождения.

Сотрудники могут оставлять пожелания, «переводить» средства (в рамках демо — имитация), смотреть календарь дней рождений и переписываться с администратором. Администратор видит суммы сборов, управляет возвратами и ведёт журнал изменений.

> Внимание: это учебный демо-проект. Вся логика работает на клиенте на mock-данных (без базы данных и бэкенда), данные после перезагрузки страницы сбрасываются.

## Технологический стек

- [Next.js 13.5](https://nextjs.org/) (App Router) + [React 18](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS 3](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [lucide-react](https://lucide.dev/) (иконки), [recharts](https://recharts.org/) (графики)
- [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) (формы и валидация)
- [next-themes](https://github.com/pacocoursey/next-themes) (переключение темы)

## Требования

- [Node.js](https://nodejs.org/) версии **18 или новее** (рекомендуется 18.17+)
- npm (поставляется вместе с Node.js)

Проверить версии:

```bash
node -v
npm -v
```

## Установка

В корневой директории проекта выполните:

```bash
npm install
```

Файл `.env` для запуска **не требуется** — приложение работает на встроенных mock-данных.

## Запуск

### Режим разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: <http://localhost:3000>

### Продакшен-сборка

```bash
npm run build
npm start
```

### Проверки кода

```bash
npm run lint        # линтинг ESLint
npm run typecheck   # проверка типов TypeScript
```

## Вход в систему

Вход выполняется по корпоративной почте `@company.com`. Демо-аккаунты:

| Роль | Email |
| --- | --- |
| Сотрудник | `anna.smirnova@company.com` |
| Администратор | `alexander.petrov@company.com` |

Полный список пользователей находится в файле [`lib/mock-data.ts`](lib/mock-data.ts).

## Страницы приложения

| Маршрут | Описание |
| --- | --- |
| `/login` | Экран входа |
| `/` | Главная: именинники сегодня и скоро, доска пожеланий, отправка средств |
| `/calendar` | Календарь дней рождений по месяцам |
| `/faq` | Частые вопросы и чат с администратором |
| `/admin` | Панель администратора (только для роли `admin`) |

## Структура проекта

```
project/
├── app/                    # роутинг (App Router)
│   ├── (auth)/login/       # экран входа
│   └── (app)/              # защищённые страницы: главная, calendar, faq, admin
├── components/
│   ├── features/           # бизнес-компоненты (BirthdayCard, DonateDialog, AdminTable, ChatThread, WishBoard)
│   ├── layout/             # Header, Footer, AuthGate, ThemeSwitcher
│   └── ui/                 # переиспользуемые UI-компоненты (shadcn/ui)
├── lib/                    # контексты, хранилище, mock-данные, типы, утилиты
├── openspec/               # спецификации проекта
├── components.json         # конфигурация shadcn/ui
├── netlify.toml            # конфигурация деплоя на Netlify
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Деплой на Netlify

Проект содержит готовую конфигурацию [`netlify.toml`](netlify.toml). Для публикации достаточно подключить репозиторий к Netlify — команда сборки `npx next build` и плагин `@netlify/plugin-nextjs` уже настроены.
