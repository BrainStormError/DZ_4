## Context

Текущее состояние:
- Все мутации данных (`addWish`, `updateWish`, `addDonation`, `addChatMessage`, `updateDonation`, `setGiftSent`) вызываются синхронно напрямую из компонентов через `useData()` контекст
- Нет единого паттерна обработки loading/error/success состояний
- Нет тестовой инфраструктуры
- Документация содержит неточности: README упоминает несуществующую папку `hooks/`, InitialSpec.md указывает Next.js 14+ вместо актуального 13.5
- Моки в `lib/data-store.ts` синхронны, но архитектура должна готовить переход к реальному API

Ограничения:
- Next.js 13.5 (App Router), React 18, TypeScript 5
- shadcn/ui + Radix UI, Tailwind CSS 3
- sonner уже в зависимостях для тостов
- lucide-react для иконок (Loader2 для спиннеров)
- Данные не персистентны (сброс при перезагрузке) — это известное ограничение, не меняем

## Goals / Non-Goals

**Goals:**
1. Внедрить `useAsyncAction` хук (паттерн TanStack Query) для единообразной обработки async состояний во всех бизнес-компонентах
2. Настроить Vitest + @testing-library/react + jsdom с `renderWithProviders` утилитой
3. Написать ≥3 теста: DonateDialog happy path, DonateDialog validation error, AdminTable role access
4. Создать `development_report.md` на русском
5. Исправить README (убрать `hooks/`) и InitialSpec.md (Next.js 13.5)
6. Все изменения обратно совместимы с текущими моками

**Non-Goals:**
- Подключение реального бэкенда / NextAuth / Stripe / БД
- Миграция моков на серверные экшены
- E2E тесты (Playwright) — отдельная задача
- Персистентность данных (localStorage/IndexedDB)
- Рефакторинг `data-store.ts` на асинхронные функции (остаются синхронными, обёрнуты в Promise)

## Decisions

### 1. Async State Pattern: `useAsyncAction` хук (не TanStack Query напрямую)

**Почему не TanStack Query прямо сейчас:**
- Добавит ~15KB gzipped к бандлу для функционала, который нужен только для мутаций
- Моки синхронны — QueryClient / кэширование избыточны
- Паттерн `useAsyncAction` даёт тот же API (`mutate`, `isLoading`, `error`, `isSuccess`) и позволит перейти на `useMutation` из TanStack Query одной строкой в будущем

**Реализация:**
```typescript
// lib/hooks/useAsyncAction.ts
export function useAsyncAction<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  options?: { onSuccess?: (data: TResult) => void; onError?: (error: Error) => void }
) {
  const [state, setState] = useState<{ data?: TResult; error?: Error; isLoading: boolean; isSuccess: boolean }>({
    data: undefined, error: undefined, isLoading: false, isSuccess: false
  });

  const mutate = useCallback(async (args: TArgs) => {
    setState(s => ({ ...s, isLoading: true, error: undefined, isSuccess: false }));
    try {
      const data = await mutationFn(args);
      setState({ data, error: undefined, isLoading: false, isSuccess: true });
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      setState(s => ({ ...s, error: error as Error, isLoading: false, isSuccess: false }));
      options?.onError?.(error as Error);
      throw error;
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => setState({ data: undefined, error: undefined, isLoading: false, isSuccess: false }), []);

  return { mutate, mutateAsync: mutate, ...state, reset };
}
```

**Использование в компонентах:**
```typescript
const addWishAction = useAsyncAction(
  (args) => Promise.resolve(data.addWish(args)),
  { onSuccess: () => toast.success('Пожелание добавлено'), onError: (e) => toast.error(e.message) }
);
// в JSX: disabled={addWishAction.isLoading}, {addWishAction.isLoading && <Loader2 />}, {addWishAction.error && <Alert>...}
```

### 2. Testing: Vitest + React Testing Library

**Почему Vitest:**
- Нативная интеграция с Vite (Next.js использует Turbopack, но Vitest работает независимо)
- Быстрый, API совместим с Jest, поддержка ESM из коробки
- Уже используется в экосистеме Next.js проектах

**Конфигурация:**
- `vitest.config.ts`: `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, алиасы `@/*` → `./*`
- `vitest.setup.ts`: `import '@testing-library/jest-dom'`, глобальный `renderWithProviders`
- `package.json`: скрипты `test`, `test:watch`, депы: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `happy-dom` (опционально)

**Тестовые файлы (co-located):**
- `components/features/DonateDialog.test.tsx` — 2 теста (happy path, validation error)
- `components/features/AdminTable.test.tsx` — 1 тест (role access)
- Дополнительно: `lib/hooks/useAsyncAction.test.ts` — юнит-тест хука

### 3. Documentation Fixes

**README.md:** Удалить строку 96 `├── hooks/` (папки нет, хуки инлайн в `lib/*-context.tsx`)

**InitialSpec.md:** Заменить строку 25 `Next.js 14+` на `Next.js 13.5 (App Router)` — документируем факт, апгрейд отдельной задачей

### 4. Development Report

Создать `development_report.md` в корне проекта на русском языке по структуре из обсуждения.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `useAsyncAction` не покрывает кэширование/дедупликацию запросов | Для моков не нужно; при переходе на API заменим на `useMutation` из TanStack Query |
| Тесты могут быть хрупкими из-за моков контекстов | `renderWithProviders` изолирует каждый тест, моки `useData` через `vi.mock` |
| Sonner тосты в jsdom могут не рендериться | Мокать `sonner` в setup или использовать `vi.mock('sonner')` |
| Апгрейд Next.js 13.5 → 14 сломает сборку | Не в scope; задокументировали текущую версию |
| `useAsyncAction` не отменяет в-flight запросы при размонтировании | Добавить `AbortController` в будущем при реальном API; для моков не критично |

## Migration Plan

1. Создать `lib/hooks/useAsyncAction.ts` + `lib/hooks/index.ts`
2. Обновить компоненты по одному: `WishBoard` → `DonateDialog` → `ChatThread` → `AdminTable` → `BirthdayCard`
3. Добавить тестовую инфраструктуру (`vitest.config.ts`, `vitest.setup.ts`, deps)
4. Написать тесты
5. Создать `development_report.md`
6. Поправить README.md и InitialSpec.md
7. Запустить `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`
8. Заархивировать изменение через `openspec archive`

## Open Questions

- Нужно ли добавлять `skip_specs: true` в `.openspec.yaml` для documentation-only фиксов? (Нет — они не меняют поведение, но specs уже созданы для async-states/testing)
- Использовать `happy-dom` вместо `jsdom` для скорости? (Оставим `jsdom` — совместимее с RTL)