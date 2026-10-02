## Why

Switching sections from the header ("Главная", "Календарь ДР", "FAQ") currently gives no feedback until the target route resolves: each section is a separate route and `app/layout.tsx:24` marks every route `force-dynamic`, so a switch is a server round-trip. There is no `loading.tsx` in the `(app)` segment, so the previous screen stays frozen and the active tab highlight only moves after navigation completes. Data is already cached in the layout-level contexts (`lib/directory-context.tsx:25`, `lib/data-store.ts:40`), so the delay is perceived, not data-driven: users see a "dead" click.

## What Changes

- Add a shared, non-blocking loading placeholder for the application content area, so activating a header section immediately shows that the switch is in progress instead of a frozen screen.
- Highlight the activated header section immediately (optimistic selected state), independent of when the route resolves.
- Keep the shell (header, menu, footer) mounted and interactive during the switch; the placeholder MUST NOT shift subsequent content (CLS-safe, matching the existing performance budget).
- No routing, data-loading, auth, or spec-level behavior changes beyond the two requirements above.

Non-goals:
- Converting the header sections into a single client-side tab shell (routing and deep links stay as they are).
- Further lazy-splitting features that live inside a page that is already a separate route — the `performance` spec explicitly forbids this, and reversing it is a separate decision.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `app-shell`: add a requirement that activating a header section immediately updates the selected state and shows a content-area loading placeholder while the section loads, without blocking scrolling or interaction.
- `performance`: add a requirement that section switching presents its feedback without waiting for the target route to resolve and does not add layout shift (feedback visible promptly; INP and CLS stay within the existing budgets).

## Impact

- `components/layout/Header.tsx` — optimistic active state for navigation items.
- `app/(app)/loading.tsx` — new shared content-area placeholder.
- `app/(app)/layout.tsx` — optional Suspense/placement adjustment so the placeholder covers only the section content.
- No changes to API routes, database, dependencies, or the app's URL structure.
