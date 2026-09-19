## ADDED Requirements

### Requirement: Eligible recipients of a money congratulation

A money congratulation MUST be available only for employees whose birthday is today or has not yet come in the current year. Employees whose birthday has already passed MUST NOT be displayed in the recipient list. The current user themself MUST NOT appear in the list.

#### Scenario: A past birthday is excluded from the list

- **WHEN** the user opens the recipient selection for a money congratulation
- **THEN** employees with a past birthday date are absent from the recipient list

#### Scenario: Today's birthday person is available

- **WHEN** an employee's birthday matches the current date
- **THEN** the employee is available in the recipient list for a money congratulation

#### Scenario: A future birthday person is available in advance

- **WHEN** an employee's birthday has not yet come in the current year
- **THEN** the employee is available in the recipient list, and funds can be sent in advance
