## 1. Async State Infrastructure

- [x] 1.1 Создать `lib/hooks/useAsyncAction.ts` с хуком `useAsyncAction<TArgs, TResult>` возвращающим `{ mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset }` — верификация: файл существует, TypeScript компилируется без ошибок (`npm run typecheck`)
- [x] 1.2 Создать `lib/hooks/index.ts` с экспортом `export * from './useAsyncAction'` — верификация: импорт работает в компонентах
- [x] 1.3 Добавить `Loader2` из `lucide-react` в компоненты для состояний загрузки (уже в deps) — верификация: иконка доступна

## 2. Component Integration — WishBoard

- [x] 2.1 Обновить `WishBoard.tsx`: обернуть `addWish` в `useAsyncAction`, добавить `disabled={isLoading}` и `Loader2` на кнопку «Отправить», тост успеха через `sonner`, `Alert` при ошибке с кнопкой «Повторить» — верификация: визуально кнопка показывает спиннер при сабмите, появляется тост/алерт
- [x] 2.2 Обновить `WishBoard.tsx`: обернуть `updateWish` (редактирование админом) в `useAsyncAction` с аналогичными состояниями в модалке — верификация: модалка редактирования показывает загрузку/успех/ошибку

## 3. Component Integration — DonateDialog

- [x] 3.1 Обновить `DonateDialog.tsx`: обернуть `addDonation` в `useAsyncAction` на шаге подтверждения (handleConfirm), добавить `disabled={isLoading}` + `Loader2` на кнопку «Поздравить»/«Отправить средства» — верификация: кнопка подтверждения показывает спиннер
- [x] 3.2 Обновить `DonateDialog.tsx`: при успехе `addDonation` (и опционально `addWish`) — показывать тост через `sonner`, переходить на шаг `success` — верификация: тост появляется, шаг success отображается
- [x] 3.3 Обновить `DonateDialog.tsx`: при ошибке на любом шаге — показывать `Alert` с текстом ошибки и кнопкой «Повторить» (вызывает `mutate` повторно) — верификация: Alert отображается, повторная отправка работает

## 4. Component Integration — ChatThread

- [x] 4.1 Обновить `ChatThread.tsx`: обернуть `addChatMessage` в `useAsyncAction`, добавить `disabled={isLoading}` + `Loader2` на кнопку «Отправить» (иконка Send) — верификация: кнопка отправки сообщения показывает спиннер
- [x] 4.2 Обновить `ChatThread.tsx`: при успехе — сообщение сразу появляется в ленте (уже работает через контекст), при ошибке — `Alert` inline с «Повторить» — верификация: ошибка отображается, повторная отправка работает

## 5. Component Integration — AdminTable

- [x] 5.1 Обновить `AdminTable.tsx`: обернуть `updateDonation` (сохранение в модалке изменения суммы) в `useAsyncAction`, `disabled={isLoading}` + `Loader2` на кнопку «Сохранить» — верификация: кнопка в модалке показывает спиннер
- [x] 5.2 Обновить `AdminTable.tsx`: обернуть `setGiftSent` (переключение статуса «Выслано/Не выслано») в `useAsyncAction`, кнопка статуса показывает спиннер, при успехе — тост «Статус обновлён», при ошибке — тост с ошибкой — верификация: переключение статуса имеет визуальную обратную связь
- [x] 5.3 Обновить `AdminTable.tsx`: при успехе `updateDonation` — закрывать модалку, обновлять таблицу и журнал — верификация: модалка закрывается, данные обновлены

## 6. Component Integration — BirthdayCard

- [x] 6.1 Обновить `BirthdayCard.tsx`: проп `onDonate` вызывает открытие `DonateDialog` (уже есть), добавить локальное состояние `isDonating` для кнопки «Поздравить» на карточке — верификация: кнопка на карточке показывает спиннер пока диалог открывается

## 7. Testing Infrastructure

- [x] 7.1 Добавить dev-зависимости в `package.json`: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `happy-dom` — верификация: `npm install` проходит
- [x] 7.2 Создать `vitest.config.ts` с `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, алиасы `@/*` → `./*`, `include: ['**/*.{test,spec}.{ts,tsx}']` — верификация: `npx vitest run --list` находит тесты
- [x] 7.3 Создать `vitest.setup.ts` с `import '@testing-library/jest-dom'`, глобальным `renderWithProviders` обёрткой (ThemeProvider, AuthProvider, DataProvider) и моками `sonner` — верификация: тесты рендерят компоненты без ошибок контекста
- [x] 7.4 Добавить npm-скрипты в `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"` — верификация: `npm run test` запускает Vitest

## 8. Unit & Integration Tests

- [x] 8.1 Создать `lib/hooks/useAsyncAction.test.ts`: тесты хука — loading/success/error/reset — верификация: `npm run test` проходит тесты хука
- [x] 8.2 Создать `components/features/DonateDialog.test.tsx`: **Тест 1 (happy path)** — рендер с провайдерами, ввод корпоративной почты → сумма → сообщение → подтверждение → проверка вызова `addDonation` с правильными аргументами и появления шага `success` — верификация: тест проходит
- [x] 8.3 Создать `components/features/DonateDialog.test.tsx`: **Тест 2 (validation error)** — ввод `user@gmail.com` → проверка inline-ошибки, блокировка перехода к шагу `amount`, `addDonation` не вызывается — верификация: тест проходит
- [x] 8.4 Создать `components/features/AdminTable.test.tsx`: **Тест 3 (role access)** — рендер под `employee` → таблица сумм скрыта/показана заглушка; рендер под `admin` → таблица видна, кнопка «Изменить» работает только при выборе причины и комментария — верификация: тест проходит

## 9. Development Report

- [x] 9.1 Создать `development_report.md` в корне проекта на русском языке по структуре: 1) Описание процесса, 2) AI-техники, 3) Примеры промптов и результаты (таблица), 4) Проблемы и решения (таблица), 5) Эффективные техники, 6) Выводы и рекомендации — верификация: файл существует, содержит все разделы

## 10. Documentation Fixes

- [x] 10.1 Исправить `README.md`: удалить строку 96 `├── hooks/` (папки не существует) — верификация: `grep -n hooks README.md` не находит строку
- [x] 10.2 Исправить `InitialSpec.md`: строку 25 заменить `Next.js 14+` на `Next.js 13.5 (App Router)` — верификация: `grep -n "Next.js" InitialSpec.md` показывает актуальную версию

## 11. Final Verification

- [x] 11.1 Запустить `npm run lint` — верификация: 0 ошибок
- [x] 11.2 Запустить `npm run typecheck` — верификация: 0 ошибок
- [x] 11.3 Запустить `npm run build` — верификация: успешная сборка
- [x] 11.4 Запустить `npm run test` — верификация: все тесты проходят (минимум 4 теста: хук + 3 интеграционных)
- [x] 11.5 Заархивировать изменение: `openspec archive add-testing-and-async-states` — верификация: изменение в архиве, `openspec list` не показывает активных изменений