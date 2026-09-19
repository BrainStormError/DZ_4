## ADDED Requirements

### Requirement: Stable date highlighting when the period changes

When switching the month or year, the calendar (MUST) update the date highlighting instantly, without a visible color transition from the state of the previous period. The highlighting of days with birthdays and the marker for the current day (MUST) immediately correspond to the selected period.

#### Scenario: Fast month switching without color bleed

- **WHEN** the user quickly switches the month forward or backward
- **THEN** the date highlighting corresponds to the selected month without a visible color-change animation between periods

#### Scenario: Switching the year

- **WHEN** the user switches the year forward or backward
- **THEN** the date highlighting immediately corresponds to the selected year, and the marker for the current day is not displayed outside the actual current year

#### Scenario: Period switching does not flicker partially

- **WHEN** months differ in the number of days
- **THEN** when the month changes, no partial highlighting bleeding from the previous month occurs
