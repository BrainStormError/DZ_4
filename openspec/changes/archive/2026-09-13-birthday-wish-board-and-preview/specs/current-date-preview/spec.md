## Purpose

Gives the administrator a safe preview mode: to view the wish board and the birthday person blocks for a selected date without changing real data and without affecting other users.

## ADDED Requirements

### Requirement: Preview date selection by an administrator

An administrator MUST be able to select a date via the calendar and enable a preview mode in which the selected day counts as the current date. Date selection MUST NOT be available to users without the administrator role and MUST NOT change real data.

#### Scenario: Enabling the preview

- **WHEN** the administrator selects a date in the calendar and confirms the preview
- **THEN** the system starts using the selected day as the current date

#### Scenario: Unavailability for an employee

- **WHEN** a user with the `employee` role views the pages available to them
- **THEN** the date preview controls are not displayed

#### Scenario: Reset to the real date

- **WHEN** the administrator clicks the preview reset
- **THEN** the system returns to the real current date

### Requirement: Read-only preview

In preview mode the system MUST NOT allow creating wishes, sending monetary congratulations and changing collection amounts. Preview mode applies only to the current session and resets on page reload.

#### Scenario: Writing is unavailable

- **WHEN** in preview mode a user tries to create a wish, send funds or change the amount
- **THEN** the action is unavailable, and real data is not changed

#### Scenario: Reset on reload

- **WHEN** a user reloads the page with the preview enabled
- **THEN** the system uses the real current date

### Requirement: A single current date for dependent blocks

In preview mode the selected date MUST be used by all date-dependent blocks: the home page's birthday person blocks, the wish board and the current-day marker in the calendar. The user MUST see an indicator of the active preview mode.

#### Scenario: Consistency of blocks

- **WHEN** the date preview is enabled
- **THEN** the birthday person blocks, the wish board and the current-day marker in the calendar show the state for the selected date

#### Scenario: Preview indicator

- **WHEN** the preview mode is active
- **THEN** the interface shows the selected date and an available reset to the real date
