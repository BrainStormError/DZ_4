## MODIFIED Requirements

### Requirement: Gift sending status

The admin panel (MUST) show the gift status for each employee: "Not sent", "Sent", or "Declined". For employees without a decline, the administrator MUST be able to change the status manually between "Not sent" and "Sent", and the change MUST be immediately reflected in the table. For an employee who has declined the gift, the status MUST be displayed as "Declined" and MUST NOT be changed manually. **Toggling the status MUST show a loading state on the button, on error — a toast/notification with "Retry", on success — the "Status updated" toast.**

#### Scenario: Default status
- **WHEN** the administrator opens the table and the gift has not yet been marked for an employee
- **THEN** the status "Not sent" is displayed for that employee

#### Scenario: The administrator marks the gift as sent
- **WHEN** the administrator manually changes an employee's status to "Sent"
- **THEN** "Sent" is displayed in the table for that employee

#### Scenario: The administrator clears the status
- **WHEN** the administrator manually returns an employee's status to "Not sent"
- **THEN** "Not sent" is displayed in the table for that employee

#### Scenario: A decline is reflected as a separate status
- **WHEN** an employee has declined the gift
- **THEN** the status "Declined" is displayed in the table for that employee

#### Scenario: The decline status is not changed manually
- **WHEN** the administrator views the row of an employee who has declined the gift
- **THEN** the status change controls for that employee are unavailable, and the status remains "Declined"

#### Scenario: Loading state when changing the gift status
- **WHEN** the administrator clicks the status toggle button (Not sent ↔ Sent)
- **THEN** the button shows `Loader2` and `disabled`, after success — the "Status updated" toast, after error — a toast with the error and a "Retry" button

### Requirement: Collection amount change log

The admin panel (MUST) provide a log of collection amount changes. Each entry MUST show the employee, the administrator, the reason, the previous and new amount, the comment, and the date. For the reason "Refund (gift declined)", the new amount MUST be displayed as equal to `0`, since declining the gift refunds the entire collection. An emergency refund MAY show a non-zero new amount. **Saving an amount change in the modal MUST show loading, error, and success.**

#### Scenario: Declining the gift zeroes the amount in the log
- **WHEN** the administrator processes a refund with the reason "Refund (gift declined)"
- **THEN** the log entry shows the change from the previous amount to `0 ₽`

#### Scenario: An emergency refund may be partial
- **WHEN** the administrator processes an emergency refund to a smaller non-zero amount
- **THEN** the log entry shows the previous and new amount as they are

#### Scenario: Empty log
- **WHEN** there have been no amount changes yet
- **THEN** the log shows an empty state

#### Scenario: Loading state when saving an amount change
- **WHEN** the administrator clicks "Save" in the amount change modal
- **THEN** the button becomes `disabled` with `Loader2`, after success — the "Amount updated" toast, the modal closes, the log refreshes, after error — an `Alert` with a "Retry" button

### Requirement: Gift status is available only to the administrator

The gift sending status MUST be displayed and changed only for the `admin` role. Users with the `employee` role MUST NOT see the gift status or its change controls.

#### Scenario: An employee does not see the gift status
- **WHEN** a user with the `employee` role views the pages available to them
- **THEN** the gift sending status and its change controls are not displayed
