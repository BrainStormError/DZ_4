# current-date-preview Specification

## Purpose

Gives the administrator a safe preview mode: to view the wish board and the birthday blocks on a selected date without changing real data and without affecting other users.

## Requirements

### Requirement: Administrator selects a preview date

The administrator MUST be able to select a date via the calendar and enable preview mode, in which the current date is considered to be the selected day. Date selection MUST NOT be available to users without the administrator role and MUST NOT change real data.

#### Scenario: Enabling preview

- **WHEN** the administrator selects a date in the calendar and confirms the preview
- **THEN** the system starts using the selected day as the current date

#### Scenario: Unavailable to an employee

- **WHEN** a user with the `employee` role views the pages available to them
- **THEN** the date preview controls are not displayed

#### Scenario: Reset to the real date

- **WHEN** the administrator clicks the preview reset
- **THEN** the system returns to the real current date

### Requirement: Read-only preview

In preview mode, the system MUST NOT allow creating wishes, sending monetary congratulations, or changing collection amounts. Preview mode applies only to the current session and is reset when the page is reloaded.

#### Scenario: Writing is unavailable

- **WHEN** in preview mode the user tries to create a wish, send funds, or change an amount
- **THEN** the action is unavailable, and real data is not changed

#### Scenario: Reset on reload

- **WHEN** the user reloads the page with preview enabled
- **THEN** the system uses the real current date

### Requirement: Single current date for dependent blocks

In preview mode, the selected date MUST be used by all date-dependent blocks: the birthday blocks of the home page, the wish board, and the current-day marker in the calendar. The user MUST see an indicator of the active preview mode.

#### Scenario: Consistency of blocks

- **WHEN** date preview is enabled
- **THEN** the birthday blocks, the wish board, and the current-day marker in the calendar show the state for the selected date

#### Scenario: Preview indicator

- **WHEN** preview mode is active
- **THEN** the interface shows the selected date and an available reset to the real date
