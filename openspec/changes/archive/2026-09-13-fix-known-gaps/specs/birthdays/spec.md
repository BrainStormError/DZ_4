## Purpose

Shows birthday people on the home page and provides a birthday calendar of employees with navigation by months and years.

## ADDED Requirements

### Requirement: Birthday people on the home page

The home page MUST show employees whose birthday falls on the current date and MUST show upcoming birthdays within the next 30 days. If there are no birthday people today, the system MUST show the corresponding empty state.

#### Scenario: There is a birthday person today

- **WHEN** the current date matches an employee's birthday
- **THEN** the employee is displayed in the "Birthday people today" block with a mark about today's celebration

#### Scenario: There are no birthday people today

- **WHEN** no birthday matches the current date
- **THEN** the system shows an empty state suggesting to look at the calendar

### Requirement: Birthday calendar with navigation by months and years

The calendar MUST display employee birthdays by month and MUST allow switching the displayed month within the selected year. The system MUST allow switching the displayed year forward and backward, showing the current year by default. Birthdays MUST be calculated relative to the selected year, and the current-day mark MUST be displayed only for the actual current year.

#### Scenario: Month switching

- **WHEN** the user clicks to go to the next month
- **THEN** the calendar shows the birthdays of the next month of the selected year

#### Scenario: Switching to the next year

- **WHEN** the user switches the year forward
- **THEN** the calendar shows the selected year and recalculates birthdays relative to it

#### Scenario: Switching to the previous year

- **WHEN** the user switches the year backward
- **THEN** the calendar shows the previous year and recalculates birthdays relative to it

#### Scenario: The current-day mark only in the current year

- **WHEN** a year other than the current one is selected
- **THEN** the current-day mark is not displayed in the calendar grid

### Requirement: Marking birthdays in the calendar grid

The calendar MUST mark in the month grid the days on which birthdays fall and MUST show the list of birthday people for the selected month.

#### Scenario: A day with a birthday

- **WHEN** there is an employee with a birthday in the selected month
- **THEN** the corresponding day in the grid is marked, and the employee is present in the list of birthday people for the month

#### Scenario: A month without birthdays

- **WHEN** there are no birthdays in the selected month
- **THEN** the system shows an empty state for this month
