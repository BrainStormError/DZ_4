# async-states Specification

## Purpose
Provides a unified pattern for handling asynchronous states (loading, error, success) for all data mutations in UI components, compatible with the current mock functions and ready to be replaced with real API calls via TanStack Query / SWR.

## Requirements

### Requirement: Unified async action hook

The system MUST provide a `useAsyncAction<TArgs, TResult>(mutationFn, options?)` hook returning an object `{ mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset }`, where `mutationFn` is an asynchronous mutation function (a wrapper over a mock or an API), and `options` are the `onSuccess`, `onError`, `onSettled` callbacks.

#### Scenario: Calling the mutation switches to loading
- **WHEN** the component calls `mutate(args)`
- **THEN** `isLoading === true`, `error === null`, `isSuccess === false` until the promise resolves

#### Scenario: Successful completion gives data and isSuccess
- **WHEN** `mutationFn` resolves with a result
- **THEN** `isLoading === false`, `isSuccess === true`, `data === result`, `error === null`

#### Scenario: An error gives error and isError
- **WHEN** `mutationFn` throws an error
- **THEN** `isLoading === false`, `isError === true`, `error` contains the error, `data === undefined`

### Requirement: Visual states in components

All business components that perform mutations (`WishBoard`, `DonateDialog`, `ChatThread`, `AdminTable`, `BirthdayCard`) MUST use `useAsyncAction` and display:
- `isLoading` → `Skeleton` / `Spinner` (shadcn `Loader2`) on buttons and in lists
- `error` → `Alert` / `Toast` (`sonner`) with the error text and a "Retry" button
- `isSuccess` → `Toast` about success, resetting the form if necessary
- `disabled={isLoading}` on all submit buttons

#### Scenario: WishBoard shows loading while creating a wish
- **WHEN** the user submits the wish form
- **THEN** the "Send" button shows `Loader2` and `disabled`, after success — the toast "Wish added", the form is reset

#### Scenario: DonateDialog shows an error when a donation fails
- **WHEN** `addDonation` throws an error
- **THEN** the current step displays an `Alert` with the error text and a "Retry" button, and the amount is not debited

#### Scenario: ChatThread shows loading while sending a message
- **WHEN** the user sends a message
- **THEN** the "Send" button shows `Loader2` and `disabled`, after success — the message appears in the strip

#### Scenario: AdminTable shows loading while changing the amount
- **WHEN** the admin saves a new amount in the modal
- **THEN** the "Save" button shows `Loader2` and `disabled`, after success — the toast "Amount updated", the modal closes

### Requirement: Compatibility with mocks and a future API

`useAsyncAction` MUST work with the current synchronous mock functions (`data-store.ts`) through a `Promise.resolve()` wrapper, and MUST be ready to replace `mutationFn` with real `fetch`/`axios` calls without changing the components' interface.

#### Scenario: Mock function wrapped in a Promise
- **WHEN** `mutationFn` = `async (args) => Promise.resolve(dataStore.addWish(args))`
- **THEN** the hook correctly transitions through loading → success, and the component receives the result
