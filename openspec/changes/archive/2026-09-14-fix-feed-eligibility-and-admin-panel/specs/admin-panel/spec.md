## Purpose

Gives the administrator a table of employees with the birthday date and the gift sending status, so as to control who the gift has already been sent to.

## ADDED Requirements

### Requirement: Birthday date in the employee table

The admin panel MUST show each employee's birthday date in the employee table. The date MUST be displayed in a readable form and allow the administrator to quickly assess upcoming birthdays.

#### Scenario: Birthday date is displayed

- **WHEN** the administrator opens the admin panel
- **THEN** the birthday date of that employee is displayed for each row in the employee table

### Requirement: Gift sending status

The admin panel MUST show, for each employee, the gift sending status "Sent" or "Not sent". The administrator MUST be able to change this status manually, and the change MUST be immediately reflected in the table.

#### Scenario: Default status

- **WHEN** the administrator opens the table and the gift has not yet been marked for an employee
- **THEN** the status "Not sent" is displayed for that employee

#### Scenario: The administrator marks the gift as sent

- **WHEN** the administrator manually changes an employee's status to "Sent"
- **THEN** "Sent" is displayed for that employee in the table

#### Scenario: The administrator clears the status

- **WHEN** the administrator manually returns an employee's status to "Not sent"
- **THEN** "Not sent" is displayed for that employee in the table

### Requirement: Gift status is available only to an administrator

The gift sending status MUST be displayed and changed only for the `admin` role. Users with the `employee` role MUST NOT see the gift status or the elements for changing it.

#### Scenario: An employee does not see the gift status

- **WHEN** a user with the `employee` role views the pages available to them
- **THEN** the gift sending status and the elements for changing it are not displayed
