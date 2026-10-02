## Context

See `proposal.md` - Why. Relevant current state:

- Header sections are separate routes (`components/layout/Header.tsx:23`), rendered as client-side `<Link>` navigations.
- `app/layout.tsx:24` sets `export const dynamic = 'force-dynamic'`, so every section transition is a server round-trip with no cached RSC payload.
- The `(app)` segment has no `loading.tsx`, so during a transition the previous screen stays unchanged and the active item (derived from `usePathname()` at `Header.tsx:77`) only updates after the route resolves.
- Section data is already resident: `DirectoryProvider` fetches once (`lib/directory-context.tsx:40-49`) and `DataProvider` fetches once (`lib/data-store.ts:40-71`) in the `(app)` layout, which persists across sibling-route navigation. The delay is therefore perceived latency from the transition, not missing data.
- The FAQ page already has an inner Suspense fallback for `useSearchParams` (`app/(app)/faq/page.tsx:152-164`) with `min-h-[60vh]` and `aria-busy`.

## Goals / Non-Goals

**Goals:**

- Make a section switch visibly start immediately (selected item + content-area placeholder) instead of showing a frozen screen.
- Keep the transition from adding layout shift or blocking interaction.
- Keep the change small and reversible; no routing or data-model changes.

**Non-Goals:**

- Removing `force-dynamic`, changing auth/redirect, or prerendering sections.
- Converting sections into a single client tab shell.
- Lazy-loading features inside a route that is already a separate page (the `performance` spec forbids this).

## Decisions

### D1: Add a shared route-segment loading placeholder at `app/(app)/loading.tsx`

Next.js App Router turns `loading.tsx` into an automatic Suspense boundary around the segment's page. Placed in `(app)`, it covers only `{children}` (the section content) while the shared `Header`/`Footer` stay mounted, which matches the spec ("shell remains interactive").

Alternatives considered:
- A `loading.tsx` per section (`/`, `/calendar`, `/faq`): more files and per-route drift for no measurable gain; one shared placeholder is enough because all sections share the same outer container.
- A global pending indicator in the header only: does not cover the content area and risks masking the section transition.

### D2: Optimistic selected state for header items

On a plain left-click of a nav item, set a local `pendingHref`; render that item as selected immediately, and clear it when `usePathname()` changes. This satisfies "item becomes selected in the same interaction" without waiting for the route.

Alternatives considered:
- `useLinkStatus` (Next 15) or `router.events` (not available in App Router 13.5) - unavailable in `next@13.5.1`.
- Relying only on `loading.tsx` - the route-level placeholder is not tied to a single header item, so the active highlight would still lag.

Boundaries: do not set `pendingHref` for modified clicks (Ctrl/Cmd/Shift/middle button), which open a new context instead. Clear on any `pathname` change so back/forward and failed transitions converge to the URL.

### D3: One shared skeleton for both loading surfaces

Extract a small presentational skeleton (stable `min-h`, `aria-busy`) used by `app/(app)/loading.tsx` and by the existing FAQ inner Suspense fallback (`app/(app)/faq/page.tsx:154`), so the two surfaces do not diverge visually. The placeholder reserves a stable minimum height and aligns with the standard `max-w-7xl px-4 sm:px-6 lg:px-8 py-8` container to keep CLS within budget.

### D4: Keep Next default prefetch

`<Link>` prefetch is on by default; it is disabled in dev and effective in production. Adding the `(app)` loading boundary lets a dynamic route prefetch the shell and placeholder, so the placeholder renders from cache on click while the section content streams. No explicit `prefetch` prop change is needed.

### D5: No changes to `force-dynamic`, routing, or data fetching

The perceived-speed problem is feedback, not server capacity. Removing `force-dynamic` would touch auth/redirect behavior and is out of scope.

## Risks / Trade-offs

- [Skeleton flashes (or is skipped) on very fast transitions] -> Keep the placeholder minimal and neutral; do not add an artificial minimum display time.
- [Two loading surfaces on FAQ (route-level + inner Suspense) can flicker] -> Use the single shared skeleton from D3 for both.
- [Optimistic highlight sticks if a transition never resolves] -> Clear `pendingHref` on any `pathname` change; modified/new-tab clicks never set it.
- [Placeholder shifts content when replaced] -> Stable minimum height and matching outer container; verify CLS stays within 0.1.
- [Dev-mode prefetch is off, so local checks can look worse than production] -> Verify navigation feedback against a production build.

## Migration Plan

No data or API migration. The change is additive (one new segment file plus small header/skeleton edits) and can be reverted by removing the loading boundary and the optimistic state.

## Open Questions

None.
