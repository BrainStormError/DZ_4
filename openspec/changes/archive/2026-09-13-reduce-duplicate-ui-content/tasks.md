## 1. Audit and preparation

- [x] 1.1 Record the initial state: `npm run typecheck` and `npm run lint` finish without new errors; save the list of `components/ui/*` files for comparison after deletion
- [x] 1.2 Recheck the actual list of unreachable UI modules by searching for imports of `@/components/ui/*`, `@/hooks/use-toast` across `app/`, `components/`, `lib/`, `hooks/`; confirm that `toast`/`toggle` are imported only inside the unreachable "island"

## 2. Deduplication of texts about voluntariness and hidden amounts

- [x] 2.1 In `app/(app)/page.tsx`, remove the hero badge "Participation is voluntary" and the privacy cards "Voluntary participation" and "Amounts are hidden", replacing the block of three cards with one compact card with the message "The team matters"; verify that the full statement about voluntariness and hiding amounts appears no more than once on the page (outside the footer)
- [x] 2.2 In `app/(app)/faq/page.tsx`, remove three quick-info cards repeating answers Q1/Q2; verify that the answers in the accordion remain the only source of wording
- [x] 2.3 In `components/features/DonateDialog.tsx`, remove the phrase about amount visibility from the `email` step block (keeping the pointer to the "Leave a wish" button), and remove the repetition about hiding the total from the `amount` step description; verify that the explanation about hiding the amount remains exactly once — at the `confirm` step — and is not shown to an administrator
- [x] 2.4 Reduce `app/(auth)/login/page.tsx` and `app/layout.tsx` to a short brand wording that does not repeat the full footer sentence; verify that the metadata remains a valid page description

## 3. Single primary wish control

- [x] 3.1 In `components/features/WishBoard.tsx`, hide the internal toggle when the `formOpen` prop is set, keeping the internal toggle in uncontrolled mode; verify that on the home page the wish form is opened by the hero button and has no second independent control
- [x] 3.2 Verify the wish scenario on the home page: opening the form, submitting, closing and reopening work through the single primary control without a second independent form state

## 4. Single source of refund reason labels

- [x] 4.1 In `components/features/AdminTable.tsx`, generate radio option labels only via `reasonLabel`; remove duplicate hardcoded reason names, leaving only self-contained explanatory labels; verify that the wording in the reason selection matches the wording in the change log

## 5. Header: navigation deduplication and the non-interactive item

- [x] 5.1 In `components/layout/Header.tsx`, extract the rendering of `navItems` and the admin link into a single function/subcomponent with a class parameter and use it for desktop and mobile; verify the active highlighting of the current section at both widths
- [x] 5.2 In the user menu, replace the item with the department with a non-interactive line (or remove it); verify that the menu has no elements that look clickable without performing an action

## 6. Removal of unreachable UI primitives

- [x] 6.1 Delete the unused files `components/ui/*` (alert-dialog, aspect-ratio, breadcrumb, calendar, carousel, chart, checkbox, collapsible, command, context-menu, drawer, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, resizable, scroll-area, separator, sheet, skeleton, slider, sonner, switch, toaster, tooltip) and the unreachable notification "island" (`components/ui/toast.tsx`, `components/ui/toggle.tsx`, `components/ui/toggle-group.tsx`, `hooks/use-toast.ts`); verify that the import search finds no references to the deleted modules
- [x] 6.2 Run `npm run typecheck` and `npm run lint` after deletion; verify there are no errors or warnings about unresolved imports

## 7. Integration verification

- [x] 7.1 Run the pages `/`, `/calendar`, `/faq`, `/admin`, `/login` in the browser: the message about voluntariness and hiding amounts is not duplicated, the wish form opens with one control, the menu has no false commands, the reasons are consistent, and there are no console errors
- [x] 7.2 Check the build (`npm run build` or an available equivalent) and make sure that deleting the primitives did not break the build
