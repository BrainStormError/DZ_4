## MODIFIED Requirements

### Requirement: Current actual date

The "Birthday people today" list and the "Today" marker MUST be computed from the current date, and NOT from a hardcoded value. By default, the current date is taken from the browser's local system date. An administrator MUST be able to enable a date preview mode in which the current date for the birthday person blocks and the wish board is taken from the selected day; the preview mode MUST NOT change real data and MUST reset to the system date.

#### Scenario: The date differs from the development date

- **WHEN** the application is opened on a day different from the hardcoded date `2026-09-13`
- **THEN** the "Birthday people today" list contains only those whose birthday matches the real date

#### Scenario: No date on the current day

- **WHEN** no employee has a birthday on the real current date
- **THEN** a message about the absence of birthday people is displayed, not a fixed employee

#### Scenario: Date preview by an administrator

- **WHEN** the administrator selects a date different from the real one in the calendar
- **THEN** the birthday person blocks and the wish board show the state for the selected date, and real data is not changed
