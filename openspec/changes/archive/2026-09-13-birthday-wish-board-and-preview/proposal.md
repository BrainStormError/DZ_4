## Why

The wish board currently shows all congratulations in a row, regardless of whose birthday it is, so "future" congratulations are visible in advance (a bad omen), and with 20+ entries the page grows. At the same time, it is unclear who congratulates whom, a monetary congratulation cannot be sent without wish text, and it is impossible to check the delayed display of birthday congratulations because "today" is not overridden anywhere.

## What Changes

- **Text on the home page.** The sentence about the collection changes to "We collect funds for gifts to colleagues for their birthdays. Any employee can join — participation is voluntary."
- **The board shows congratulations by birthday.** The board MUST show wishes only for employees whose birthday is today (an administrator is also an employee). If there are no birthday people today, wishes for the nearest past birthday date MUST be shown (all employees born on that day). Wishes for future birthdays MUST NOT ever be shown.
- **Monetary congratulation with or without a wish.** The "Congratulation" step in the participation dialog becomes optional: without text, the funds are added to the collection and no wish is created on the board. A monetary congratulation can be sent in advance; it appears on the board according to the birthday rule.
- **Administrator date preview.** An administrator MUST be able to pick a date via the calendar and view the board and birthday person blocks "as if that date were today". The preview mode is read-only (without creating wishes and without changing amounts), administrator-only, with a reset to the real date and a reset on reload; real data is not changed.
- **Clear form and full names.** On the board card, the direction is shown explicitly: `From: Dmitry Volkov (dmitry.volkov) → To: Anna Smirnova`. The author is displayed by real name with the corporate nick in parentheses (the full email address is not disclosed), and the recipient by last name and first name. The wish creation form gets a clear heading "Whom we congratulate" and shows the sender.
- **Scrolling strip.** Congratulations for the day's birthday people are shown as a single looping strip with smooth automatic scrolling and color highlighting per birthday person. The same strip is used for the nearest past date. Scrolling pauses on hover/focus and is disabled under `prefers-reduced-motion`.

## Capabilities

### New Capabilities

- `current-date-preview`: administrative preview mode for the "current date" (day selection, scope, read-only, reset, indication).

### Modified Capabilities

- `wishes`: the board filters wishes by the recipient's birthday (today, otherwise the nearest past date; never the future); the author is displayed as a real name with the nick in parentheses, the recipient by last name and first name; the form becomes clearer; the strip for the day's birthday people loops with color highlighting and accessible scrolling.
- `birthdays`: the definition of "today" allows an administrative date preview in addition to the system clock; the home page blocks and the calendar use a single date source.
- `donations`: the congratulation step in the participation dialog becomes optional, and the participation result distinguishes the scenario with a wish from the one without.
- `ui-consistency`: the canonical statement about voluntariness is reworded with new text.

## Impact

- `app/(app)/page.tsx` — new text, a single source of "today", birthday person blocks.
- `components/features/WishBoard.tsx` — birthday filtering, cards with names and direction, form, looping strip.
- `components/features/DonateDialog.tsx` — optional congratulation step and a result without a wish.
- `lib/data-context.tsx` / new date provider — shared source of "today" and preview mode.
- `app/(app)/admin/page.tsx` (or `components/features/AdminTable.tsx`) — date preview calendar.
- `app/(app)/calendar/page.tsx` — the "today" marker from the shared date source.
- `openspec/specs/*` — deltas for new and modified capabilities.
- Out of scope: a real backend, data persistence, deleting wishes, the role model, hiding amounts from employees.
