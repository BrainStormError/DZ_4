## ADDED Requirements

### Requirement: Change log of collection amounts

The admin panel (MUST) provide a change log of collection amounts. Each entry (MUST) show the employee, the administrator, the reason, the previous and new amount, the comment, and the date. For the reason "Refund (gift declined)", the new amount (MUST) be displayed as `0`, since declining a gift refunds the entire collection. An emergency refund MAY show a non-zero new amount.

#### Scenario: Declining a gift zeroes the amount in the log

- **WHEN** an administrator processes a refund with the reason "Refund (gift declined)"
- **THEN** the log entry shows a change from the previous amount to `0 ₽`

#### Scenario: An emergency refund may be partial

- **WHEN** an administrator processes an emergency refund for a smaller non-zero amount
- **THEN** the log entry shows the previous and new amount as they are

#### Scenario: Empty log

- **WHEN** there have been no amount changes yet
- **THEN** the log shows an empty state

### Requirement: Explicit switching between the table and the log

Switching between the collection table and the change log (MUST) be explicit. The controls (MUST) show both available views and the current state. Returning to the table (MUST NOT) require pressing the same control that opened the log again.

#### Scenario: Switching to the log

- **WHEN** the administrator selects the "Change log" view
- **THEN** the log is displayed, and the active view is explicitly indicated

#### Scenario: Returning to the collection table

- **WHEN** the administrator selects the "Collection table" view
- **THEN** the employee table is displayed, and returning is done by a separate view selection, not by pressing the log button again

#### Scenario: Available only to the administrator

- **WHEN** a user with the `employee` role browses the pages available to them
- **THEN** the controls for switching the table and the log, as well as the log itself, are not displayed
