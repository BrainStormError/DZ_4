## Context

The application is Next.js 13 App Router served behind a strict Content-Security-Policy produced in `middleware.ts`. The policy uses `script-src 'self' 'nonce-<per-request>' 'strict-dynamic'` and `connect-src 'self'`, and a per-request nonce is handed to the inline theme bootstrap in `app/layout.tsx`. The provided Yandex Metrika snippet sets `ssr:true`, which means the counter is meant to be initialized from server-rendered markup in `<head>`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Load the provided counter (id `113274971`) on every page with the existing nonce.
- Send data to Metrika by extending only `connect-src`; keep `script-src` unchanged.
- Render no visible analytics UI.

**Non-Goals:**
- No click/goal tracking on specific buttons (the original "Google login button" ask is out of scope for this change).
- No counter-id environment configuration; the id is hardcoded from the snippet.
- No removal of the framing protection or the inline bootstrap.

## Decisions

**Load the counter as an inline `<head>` script with the nonce, not `next/script`.**
The project already fetches the nonce in `app/layout.tsx` and renders the theme bootstrap as `<script nonce={nonce} dangerouslySetInnerHTML=... />`. The Metrika snippet uses `ssr:true`, which expects server-rendered initialization in `<head>`, so mirroring the existing pattern is the least-surprising change and needs no new import or dependency. Alternative considered: `next/script strategy="afterInteractive"` — cleaner for client-only counters, but `ssr:true` implies `<head>` SSR, and `afterInteractive` would load the counter after hydration instead of matching the snippet.

**Extend only `connect-src`; leave `script-src` untouched.**
Because `script-src` already contains `strict-dynamic`, a nonce'd inline script is trusted and the `tag.js` it injects (and the scripts `tag.js` loads in turn) are also trusted. Host allowlist entries in `script-src` would be ignored under `strict-dynamic`, so adding them would be pointless. The only directive that blocks the counter is `connect-src 'self'`, so it becomes `connect-src 'self' https://mc.yandex.ru https://yastatic.net https://yandex.ru`. `img-src` already permits `https:` for the `<noscript>` fallback.

**Keep the `<noscript>` fallback image.**
The snippet's `<noscript>` watch image records visits for browsers without JavaScript. It is invisible (`left: -9999px`) and already allowed by `img-src ... https:`.

## Risks / Trade-offs

- [Blocking data while the CSP is too strict] → extend `connect-src` exactly as described and verify in the built application that the console shows no policy violation and the counter sends data.
- [Adding Metrika hosts to `script-src` would be silently ignored] → rely on the nonce + `strict-dynamic` path and document why `script-src` is unchanged.
- [Hardcoded counter id fires in development and tests] → acceptable for this scope; the counter id is not a secret, and component tests do not render the root layout.
- [WebVisor/click map assets live on `yastatic.net`] → included in `connect-src`; if a future Metrika version adds another endpoint, extend the directive accordingly.
