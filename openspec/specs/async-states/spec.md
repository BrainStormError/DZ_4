# async-states Specification

## Purpose
Обеспечивает единый паттерн обработки асинхронных состояний (загрузка, ошибка, успех) для всех мутаций данных в UI-компонентах, совместимый с текущими мок-функциями и готовый к замене на реальные API-вызовы через TanStack Query / SWR.

## Requirements

### Requirement: Единый хук асинхронных действий

Система ДОЛЖНА предоставлять хук `useAsyncAction<TArgs, TResult>(mutationFn, options?)`, возвращающий объект `{ mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset }`, где `mutationFn` — асинхронная функция мутации (обёртка над моком или API), а `options` — колбэки `onSuccess`, `onError`, `onSettled`.

#### Scenario: Вызов мутации переводит в loading
- **WHEN** компонент вызывает `mutate(args)`
- **THEN** `isLoading === true`, `error === null`, `isSuccess === false` до разрешения промиса

#### Scenario: Успешное завершение даёт data и isSuccess
- **WHEN** `mutationFn` разрешается с результатом
- **THEN** `isLoading === false`, `isSuccess === true`, `data === result`, `error === null`

#### Scenario: Ошибка даёт error и isError
- **WHEN** `mutationFn` выбрасывает ошибку
- **THEN** `isLoading === false`, `isError === true`, `error` содержит ошибку, `data === undefined`

### Requirement: Визуальные состояния в компонентах

Все бизнес-компоненты, выполняющие мутации (`WishBoard`, `DonateDialog`, `ChatThread`, `AdminTable`, `BirthdayCard`), ДОЛЖНЫ использовать `useAsyncAction` и отображать:
- `isLoading` → `Skeleton` / `Spinner` (shadcn `Loader2`) на кнопках и в списках
- `error` → `Alert` / `Toast` (`sonner`) с текстом ошибки и кнопкой «Повторить»
- `isSuccess` → `Toast` об успехе, сброс формы при необходимости
- `disabled={isLoading}` на всех кнопках сабмита

#### Scenario: WishBoard показывает загрузку при создании пожелания
- **WHEN** пользователь отправляет форму пожелания
- **THEN** кнопка «Отправить» показывает `Loader2` и `disabled`, после успеха — тост «Пожелание добавлено», форма сбрасывается

#### Scenario: DonateDialog показывает ошибку при сбое доната
- **WHEN** `addDonation` выбрасывает ошибку
- **THEN** на текущем шаге отображается `Alert` с текстом ошибки и кнопкой «Повторить», сумма не списывается

#### Scenario: ChatThread показывает загрузку при отправке сообщения
- **WHEN** пользователь отправляет сообщение
- **THEN** кнопка «Отправить» показывает `Loader2` и `disabled`, после успеха — сообщение появляется в ленте

#### Scenario: AdminTable показывает загрузку при изменении суммы
- **WHEN** админ сохраняет новую сумму в модалке
- **THEN** кнопка «Сохранить» показывает `Loader2` и `disabled`, после успеха — тост «Сумма обновлена», модалка закрывается

### Requirement: Совместимость с моками и будущим API

`useAsyncAction` ДОЛЖЕН работать с текущими синхронными мок-функциями (`data-store.ts`) через обёртку в `Promise.resolve()`, и ДОЛЖЕН быть готовым к замене `mutationFn` на реальные `fetch`/`axios` вызовы без изменения интерфейса компонентов.

#### Scenario: Мок-функция обёрнута в Promise
- **WHEN** `mutationFn` = `async (args) => Promise.resolve(dataStore.addWish(args))`
- **THEN** хук корректно переходит через loading → success, компонент получает результат
