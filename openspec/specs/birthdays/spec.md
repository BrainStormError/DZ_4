# birthdays Specification

## Purpose

Shows the birthday people on the home page and provides a calendar of employee birthdays with navigation across months and years.

## Requirements

### Requirement: Birthday people on the home page

The home page MUST show employees whose birthday falls on the current date and MUST show the upcoming birthdays within the next 30 days. If there are no birthday people today, the system MUST show a corresponding empty state.

#### Scenario: There is a birthday person today

- **WHEN** the current date matches an employee's birthday
- **THEN** the employee is displayed in the "Birthday people today" block with a mark for today's celebration

#### Scenario: There are no birthday people today

- **WHEN** no birthday matches the current date
- **THEN** the system shows an empty state suggesting to look at the calendar

### Requirement: Birthday calendar with navigation across months and years

The calendar MUST display employees' birthdays by month and MUST allow switching the displayed month within the selected year. The system MUST allow switching the displayed year forward and backward, showing the current year by default. Birthdays MUST be calculated relative to the selected year, and the current-day marker MUST be displayed only for the actual current year.

#### Scenario: Month switching

- **WHEN** the user clicks to go to the next month
- **THEN** the calendar shows the birthdays of the next month of the selected year

#### Scenario: Switching to the next year

- **WHEN** the user switches the year forward
- **THEN** the calendar shows the selected year and recalculates the birthdays relative to it

#### Scenario: Switching to the previous year

- **WHEN** the user switches the year backward
- **THEN** the calendar shows the previous year and recalculates the birthdays relative to it

#### Scenario: Current-day marker only in the current year

- **WHEN** a year other than the current one is selected
- **THEN** the current-day marker is not displayed in the calendar grid

### Requirement: Marking birthdays in the calendar grid

The calendar MUST mark in the month grid the days on which birthdays fall and MUST show the list of birthday people of the selected month.

#### Scenario: A day with a birthday

- **WHEN** the selected month has an employee with a birthday
- **THEN** the corresponding day in the grid is marked, and the employee is present in the list of birthday people of the month

#### Scenario: A month without birthdays

- **WHEN** the selected month has no birthdays
- **THEN** the system shows an empty state for that month

### Requirement: Actual current date

The "Birthday people today" list and the "Today" flag MUST be computed from the current date, and NOT from a hardcoded value. By default the current date is taken from the browser's local system date. The administrator MUST be able to enable a date preview mode, in which the current date for the birthday blocks and the wish board is taken from the selected day; preview mode MUST NOT change real data and MUST be reset to the system date.

#### Scenario: The date differs from the development date

- **WHEN** the application is opened on a day other than the hardcoded date `2026-09-13`
- **THEN** "Birthday people today" contains only those whose birthday matches the real date

#### Scenario: No birthdays on the current day

- **WHEN** none of the employees has a birthday on the real current date
- **THEN** a message about the absence of birthday people is displayed, and not a fixed employee

#### Scenario: Date preview by the administrator

- **WHEN** the administrator selects a date in the calendar that differs from the real one
- **THEN** the birthday blocks and the wish board show the state for the selected date, and real data is not changed

### Requirement: Local time zone handling

Determining the current day MUST use the browser's local calendar date uniformly for comparing the month and the day. The transition of the day MUST NOT shift the displayed "today" day because of parsing the date in UTC.

#### Scenario: A time zone with a negative offset

- **WHEN** the browser is in a time zone west of UTC
- **THEN** "today" corresponds to the browser's local date and is not shifted to the previous day

### Requirement: Calendar starting month

The birthday calendar MUST open on the current month and the current year. The user MUST be able to switch the month and the year in both directions.

#### Scenario: The current month is not September

- **WHEN** the calendar opens in a month other than September
- **THEN** the current month and the current year are displayed by default

#### Scenario: Calendar navigation

- **WHEN** the user switches the month or the year
- **THEN** the heading and the list of birthday people correspond to the selected period

### Requirement: Correct number forms and cases

The label for the number of birthday people MUST use the correct Russian language forms: `1 именинник`, `2–4 именинника`, `5 и более именинников`. The list heading MUST use the prepositional case of the month («Именинники в сентябре 2026»).

#### Scenario: Two birthday people

- **WHEN** the selected month has exactly two birthday people
- **THEN** «2 именинника» is displayed, and not «2 именинников»

#### Scenario: Five or more birthday people

- **WHEN** the selected month has five or more birthday people
- **THEN** the form «именинников» is displayed

#### Scenario: Month heading

- **WHEN** the list of birthday people of the month is displayed
- **THEN** the heading contains the prepositional case, for example «Именинники в сентябре 2026»

### Requirement: Single color of a birthday person in the card and the strip

The employee card in the "Birthday people today" block and the cards of their congratulations in the strip MUST use the same personal color. The color MUST be assigned to the employee deterministically so that the same birthday person is recognizable in all blocks of the page.

#### Scenario: The card color matches the color of the congratulations

- **WHEN** an employee is displayed in the "Birthday people today" block and their congratulations are displayed in the strip
- **THEN** the border of the birthday person's card matches in color the border of the cards of their congratulations

#### Scenario: Different birthday people differ in color

- **WHEN** the strip contains congratulations for several birthday people
- **THEN** each birthday person gets their own color, different from the color of another birthday person

### Requirement: Stable date highlighting when the period changes

When the month or the year is switched, the calendar MUST update the date highlighting instantly, without a visible color transition from the state of the previous period. The highlighting of days with birthdays and the current-day marker MUST immediately correspond to the selected period.

#### Scenario: Rapid month switching without color bleeding

- **WHEN** the user rapidly switches the month forward or backward
- **THEN** the date highlighting corresponds to the selected month without a visible color-change animation between periods

#### Scenario: Year switching

- **WHEN** the user switches the year forward or backward
- **THEN** the date highlighting immediately corresponds to the selected year, and the current-day marker is not displayed outside the actual current year

#### Scenario: Period switching does not partially flicker

- **WHEN** the months differ in the number of days
- **THEN** when the month changes, no partial highlighting bleeding from the previous month occurs

### Requirement: Calendar navigation on a narrow screen

Navigation across months and years MUST remain fully available at widths of 320–360px and MUST NOT create horizontal overflow of the page. The group of switching buttons MUST wrap or shrink so that all buttons and the heading of the current month are visible at the same time.

#### Scenario: Navigation at 320px

- **WHEN** the calendar is open at a width of 320px
- **THEN** all month and year switching buttons and the heading are visible, and the page does not get horizontal scroll

#### Scenario: Month switching on a narrow screen

- **WHEN** the user clicks to go to the next month on a narrow screen
- **THEN** the calendar shows the next month, and the navigation remains available without changing the page width

### Requirement: Readability of calendar cells on a narrow screen

The content of a day cell MUST remain readable on narrow screens. On screens smaller than `sm`, the names of birthday people MUST NOT be displayed in a truncated form leaving a single letter; instead of a truncated name, a compact birthday marker with an accessible full name MUST be shown.

#### Scenario: A cell with a birthday person on a narrow screen

- **WHEN** a day cell contains a birthday person, and the screen is smaller than `sm`
- **THEN** instead of a name truncated to a single letter, a compact marker is displayed, and the full name is available to the user

#### Scenario: The birthday marker is discernible

- **WHEN** a day has birthdays on a narrow screen
- **THEN** the presence of a birthday person on that day remains visually discernible

### Requirement: Grid of upcoming birthday people without name truncation

The cards of the upcoming birthdays block MUST be displayed so that the employee's last name and first name are not truncated at any screen width from 320px. Where two columns do not leave enough room for the name, the cards MUST be placed one below another in a single column. The number of columns MUST increase gradually as the screen width grows and grow only when the name fits entirely.

#### Scenario: Narrow 320px screen

- **WHEN** the upcoming birthdays block is displayed at a width of 320px
- **THEN** the cards go in one column, and each name is displayed in full

#### Scenario: Mobile width

- **WHEN** the upcoming birthdays block is displayed at a width of 360–414px
- **THEN** the employee's name is not truncated, including if the cards remain in one column for that reason

#### Scenario: Tablet width

- **WHEN** the upcoming birthdays block is displayed at a width of about 640px
- **THEN** the number of columns does not lead to name truncation, and the card shows the name in full

#### Scenario: Wide layout

- **WHEN** the screen width is sufficient for a larger number of columns
- **THEN** the grid uses a wider layout without losing name readability
