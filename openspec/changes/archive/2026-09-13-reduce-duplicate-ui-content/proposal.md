## Why

An analysis of the "Korporpodarki" interface showed that the same message about the voluntariness of participation and hidden amounts is repeated in roughly ten places (home page, FAQ, participation dialog, footer, login, metadata), and that refund reason wordings are duplicated outside the single source `reasonLabel`. At the same time, the project had accumulated 30 unused UI primitives and a non-interactive menu item that looks like an action. This increases the risk of texts getting out of sync and bloats the codebase.

## What Changes

- **A single source of the message about voluntariness and hidden amounts.** The same statement ("participation is voluntary; collection amounts are visible only to the administrator") MUST NOT be duplicated on one page. The footer remains the canonical place; on the home page, in the FAQ and in the participation dialog, no more than one contextual mention remains.
- **Duplication on the home page removed.** The duplicate "Participation is voluntary" badge in the hero and the block of three privacy cards repeating the hero text are removed; one consistent block remains.
- **Duplicate in the FAQ removed.** Three quick-info cards repeating answers Q1/Q2 and the home page text are removed; the "Questions and Answers" section becomes the only source of wording.
- **Participation dialog deduplication.** Repeated explanations about hiding the amount at the `email`/`amount`/`confirm` steps are removed; one contextual explanation remains at the relevant step.
- **A single control per action.** The "participation in the collection" action and the "wish without a contribution" action MUST have one primary control; duplicate buttons leading to the same scenario from the same page MUST NOT be displayed simultaneously.
- **Header navigation deduplication.** Desktop and mobile navigation are generated from one `navItems`/admin link description instead of two independent copies of markup.
- **A single source of refund reasons.** Reason labels are generated only via `reasonLabel`; duplicate hardcoded reason strings are removed.
- **Non-interactive menu item eliminated.** The item with the user's department stops looking like a command (it is converted to a non-interactive display or removed).
- **Unused UI primitives removed.** 30 files `components/ui/*` unreachable from the application code are deleted, along with the unused notification "island" (`hooks/use-toast.ts`, `toast.tsx`, `toaster.tsx`, `sonner.tsx`) and `toggle.tsx`/`toggle-group.tsx`. **BREAKING** for external imports of these primitives, if any appear.

**Out of scope:** the behavior of participation scenarios, amount validation rules, the role model, themes and the avatar source are not changed; no persistence is introduced.

## Capabilities

### New Capabilities

- `ui-consistency`: a single source of user-facing wording (voluntariness and hidden amounts, refund reasons), one primary control per action, no non-interactive elements acting as actions, no unused UI primitives.

### Modified Capabilities

<!-- Main specifications in openspec/specs/ are still absent: the domain deltas (donations, support-chat) live in the unarchived changes fix-known-gaps and fix-qa-reported-defects and are applied on top of the new ui-consistency/design during synchronization. Separate MODIFIED deltas are not created in order not to conflict with them. -->

## Impact

- `components/layout/Footer.tsx` — the canonical message about voluntariness and hidden amounts.
- `app/(app)/page.tsx` — removal of the duplicate badge and privacy cards, a single participation CTA.
- `app/(app)/faq/page.tsx` — removal of duplicate quick-info cards.
- `components/features/DonateDialog.tsx` — one contextual explanation about hiding the amount instead of repetitions.
- `components/features/WishBoard.tsx`, `app/(app)/page.tsx` — one primary control for a wish without a contribution.
- `components/features/AdminTable.tsx`, `lib/data-store.ts` — a single source of reason labels (`reasonLabel`).
- `components/layout/Header.tsx` — deduplication of navigation markup and elimination of the non-interactive menu item.
- `components/ui/*` (30 files), `components/ui/toast.tsx`, `components/ui/toaster.tsx`, `components/ui/sonner.tsx`, `components/ui/toggle.tsx`, `components/ui/toggle-group.tsx`, `hooks/use-toast.ts` — removal of unreachable code.
- `app/(auth)/login/page.tsx`, `app/layout.tsx` — aligning the subtitle with the single wording.
- The change adds no external APIs, dependencies or backend; the application remains a client-side demo on mock data.
