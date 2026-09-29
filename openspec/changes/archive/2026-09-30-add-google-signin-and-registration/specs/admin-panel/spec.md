## MODIFIED Requirements

### Requirement: Collection amount change log

The admin panel MUST provide a log of collection amount changes. Each entry MUST show the employee, the administrator, the reason, the previous and new amount, the comment, and the date. For the reason "Refund (gift declined)" the new amount MUST be displayed as `0`, since declining the gift returns the entire collection. An emergency refund MAY show a non-zero new amount. **Saving an amount change in the modal MUST show loading, error, and success.** The amount change modal MUST NOT display a missing employee name, an empty placeholder, or a value that does not belong to the change while it closes: after a successful save the modal MUST close and MUST NOT render partial data during the closing transition.

#### Scenario: Declining the gift zeroes the amount in the log
- **WHEN** the administrator processes a refund with the reason "Refund (gift declined)"
- **THEN** the log entry shows a change from the previous amount to `0 ₽`

#### Scenario: An emergency refund may be partial
- **WHEN** the administrator processes an emergency refund for a smaller non-zero amount
- **THEN** the log entry shows the previous and the new amount as they are

#### Scenario: Empty log
- **WHEN** no amount changes have occurred yet
- **THEN** the log shows an empty state

#### Scenario: Loading state when saving an amount change
- **WHEN** the administrator clicks "Save" in the amount change modal
- **THEN** the button becomes `disabled` with `Loader2`, after success — the toast "Amount updated", the modal closes, the log is refreshed, after error — an `Alert` with a "Retry" button

#### Scenario: The modal closes without partial data
- **WHEN** the administrator saves an amount change successfully
- **THEN** the modal closes, and during the closing transition it does not show a missing employee name or an amount that was substituted for the edited employee
