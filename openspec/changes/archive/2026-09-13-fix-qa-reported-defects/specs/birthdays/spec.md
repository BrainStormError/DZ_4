## Purpose

Defines the display of birthday people on the home page and in the birthday calendar: the current system date, the correct local time zone, the calendar's starting month, and grammatically correct labels.

## ADDED Requirements

### Requirement: Current date

The "Birthday people today" list and the "Today" indicator MUST be computed from the system date at the moment of display, and NOT from a hardcoded value. The user MUST see the birthday people whose birthday matches the real current date.

#### Scenario: Date differs from the development date

- **WHEN** the application is opened on a day different from the hardcoded date `2026-09-13`
- **THEN** "Birthday people today" contains only those whose birthday matches the real date

#### Scenario: No dates on the current day

- **WHEN** none of the employees has a birthday on the real current date
- **THEN** a message about the absence of birthday people is displayed, rather than a fixed employee

### Requirement: Local time zone handling

The determination of the current day MUST use the browser's local calendar date uniformly for comparing the month and day. The day rollover MUST NOT shift the displayed "today" day due to date parsing in UTC.

#### Scenario: Time zone with a negative offset

- **WHEN** the browser is in a time zone west of UTC
- **THEN** "today" corresponds to the browser's local date and does not shift to the previous day

### Requirement: Calendar starting month

The birthday calendar MUST open on the current month and the current year. The user MUST be able to switch the month and year in both directions.

#### Scenario: Current month is not September

- **WHEN** the calendar opens in a month other than September
- **THEN** the current month and the current year are displayed by default

#### Scenario: Calendar navigation

- **WHEN** the user switches the month or year
- **THEN** the heading and the birthday people list correspond to the selected period

### Requirement: Correct number forms and cases

The label for the number of birthday people MUST use the correct language forms: `1 именинник`, `2–4 именинника`, `5 и более именинников`. The list heading MUST use the prepositional case of the month ("Birthday people in September 2026").

#### Scenario: Two birthday people

- **WHEN** there are exactly two birthday people in the selected month
- **THEN** the correct form "2 birthday people" is displayed, not an incorrect plural form

#### Scenario: Five or more birthday people

- **WHEN** there are five or more birthday people in the selected month
- **THEN** the "birthday people" form is displayed

#### Scenario: Month heading

- **WHEN** the list of birthday people for the month is displayed
- **THEN** the heading contains the prepositional case, for example "Birthday people in September 2026"
