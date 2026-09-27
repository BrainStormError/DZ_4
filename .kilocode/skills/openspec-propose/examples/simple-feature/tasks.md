# Tasks: add-user-auth

## 1. Data layer

- [ ] 1.1 Add `users` table (id, email, password_hash, created_at)
- [ ] 1.2 Add unique index on `email`

## 2. Authentication

- [ ] 2.1 Implement `POST /login` with password verification
- [ ] 2.2 Implement session cookie issuance and `POST /logout`

## 3. Routes

- [ ] 3.1 Add middleware requiring a session for `/account/**`
- [ ] 3.2 Redirect anonymous requests to `/login`

## 4. Verification

- [ ] 4.1 Tests: valid login, invalid login, protected route redirect
