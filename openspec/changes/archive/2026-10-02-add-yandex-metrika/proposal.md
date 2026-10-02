## Why

The project needs anonymous visit analytics via Yandex Metrika. The counter must be added without displaying any widget or statistics on the site, and without breaking the strict Content-Security-Policy (framing protection + inline bootstrap) introduced in earlier changes.

## What Changes

- Add the Yandex Metrika counter (id `113274971`) so it loads on every page and records page views, click maps, and WebVisor sessions.
- Load the counter as an inline `<head>` script carrying the existing per-request CSP nonce, following the same pattern as the theme bootstrap script, with `ssr:true` to match the provided snippet.
- Render no visible UI: no informer or widget is added; WebVisor and click map recording stay invisible to visitors.
- Extend the CSP `connect-src` directive so the counter can send data to Yandex Metrika endpoints (`mc.yandex.ru`, `yastatic.net`, `yandex.ru`), while keeping `script-src` unchanged (nonce + `strict-dynamic` already trusts the counter and the scripts it loads).

## Capabilities

### New Capabilities

- `analytics`: anonymous visit tracking through the Yandex Metrika counter, with no visible UI and no conflict with the security policy.

### Modified Capabilities

- `deployment`: the "Security response headers" requirement changes so the Content-Security-Policy additionally permits outbound connections to the analytics endpoints, while still preventing framing and allowing the inline bootstrap.

## Impact

- `middleware.ts`: `connect-src` gains the Yandex Metrika endpoints.
- `app/layout.tsx`: adds the inline counter script and its `<noscript>` fallback image alongside the existing theme bootstrap.
- `openspec/specs/deployment/spec.md`: the CSP requirement is updated via the delta spec.
- No new dependencies; the counter id is hardcoded from the provided snippet.
