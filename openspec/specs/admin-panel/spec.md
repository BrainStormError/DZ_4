# admin-panel Specification

## Purpose

Gives the administrator a table of employees with their birthday date and gift-sending status, so that they can control who has already been sent a gift.

## Requirements

### Requirement: Birthday date in the employee table

The admin panel MUST show the birthday date of each employee in the employee table. The date MUST be displayed in a readable form and allow the administrator to quickly assess the upcoming birthdays.

#### Scenario: Birthday date is displayed

- **WHEN** the administrator opens the admin panel
- **THEN** the employee table displays the birthday date of that employee for each row

### Requirement: Gift-sending status

The admin panel MUST show a gift status for each employee: "Not sent", "Sent", or "Declined". For employees who have not declined, the administrator MUST be able to change the status manually between "Not sent" and "Sent", and the change MUST be immediately reflected in the table. For an employee who declined the gift, the status MUST be displayed as "Declined" and MUST NOT be changed manually. **Toggling the status MUST show a loading state on the button, on error — a toast/notification with "Retry", on success — a toast "Status updated".**

#### Scenario: Default status
- **WHEN** the administrator opens the table and the gift has not yet been marked for an employee
- **THEN** the status "Not sent" is displayed for that employee

#### Scenario: Administrator marks the gift as sent
- **WHEN** the administrator manually changes the employee's status to "Sent"
- **THEN** "Sent" is displayed in the table for that employee

#### Scenario: Administrator clears the status
- **WHEN** the administrator manually returns the employee's status to "Not sent"
- **THEN** "Not sent" is displayed in the table for that employee

#### Scenario: Decline is reflected as a separate status
- **WHEN** an employee declined the gift
- **THEN** the status "Declined" is displayed in the table for that employee

#### Scenario: Decline status is not changed manually
- **WHEN** the administrator views the row of an employee who declined the gift
- **THEN** the status-change controls for that employee are unavailable, and the status remains "Declined"

#### Scenario: Loading state when changing the gift status
- **WHEN** the administrator clicks the status toggle button (Not sent ↔ Sent)
- **THEN** the button shows `Loader2` and `disabled`, after success — the toast "Status updated", after error — an error toast with a "Retry" button

### Requirement: Gift status is available only to the administrator

The gift-sending status MUST be displayed and changed only for the `admin` role. Users with the `employee` role MUST NOT see the gift status or its change controls.

#### Scenario: Employee does not see the gift status
- **WHEN** a user with the `employee` role views the pages available to them
- **THEN** the gift-sending status and its change controls are not displayed

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

### Requirement: Explicit switching between the table and the log

Switching between the collection table and the change log MUST be explicit. The controls MUST show both available views and the current state. Returning to the table MUST NOT require pressing the same control again that opened the log.

#### Scenario: Switching to the log

- **WHEN** the administrator selects the "Change log" view
- **THEN** the log is displayed, and the active view is explicitly indicated

#### Scenario: Returning to the collection table

- **WHEN** the administrator selects the "Collection table" view
- **THEN** the employee table is displayed, and the return is performed by a separate view selection, and not by pressing the log button again

#### Scenario: Available only to the administrator

- **WHEN** a user with the `employee` role views the pages available to them
- **THEN** the table/log switching controls and the log itself are not displayed

### Requirement: The collection table is usable on a narrow screen

The collection table MUST remain usable on narrow screens. At mobile sizes the system MUST either present the rows as a list of cards or hide secondary columns so that the key information and the action remain visible. Horizontal scrolling MUST be internal to the table area only and MUST NOT create horizontal scrolling of the page.

#### Scenario: Table on mobile

- **WHEN** the administrator opens the collection table on a narrow screen
- **THEN** the key information about the employee and the action are available without horizontal scrolling of the page

#### Scenario: Action column is reachable

- **WHEN** the administrator views an employee row on a narrow screen
- **THEN** the row change action is reachable, and not hidden beyond the edge

### Requirement: Single table scroll container

The table area MUST NOT contain nested duplicate horizontal scroll containers. Table scrolling MUST be performed in a single container.

#### Scenario: No double scrolling

- **WHEN** the user scrolls the table horizontally
- **THEN** only one container scrolls, without nested double scrolling
