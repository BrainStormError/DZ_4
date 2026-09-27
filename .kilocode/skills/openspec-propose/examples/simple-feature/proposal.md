# Proposal: add-user-auth

## Why

Authenticated areas of the product are unreachable today; there is no way to sign in.

## What Changes

- Add email + password sign-in that creates a server-side session.
- Protect `/account/**` routes; redirect anonymous visitors to `/login`.
- Add a `/logout` route that ends the session.

## Impact

- New capability: `user-auth`.
- Existing capability `web-routing` is unaffected.
