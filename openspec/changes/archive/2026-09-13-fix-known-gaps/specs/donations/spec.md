## Purpose

Allows the employee to participate in the voluntary collection only after confirming their corporate email and guarantees that collection amounts are not disclosed to employees.

## ADDED Requirements

### Requirement: Corporate email confirmation before participation

The system MUST require corporate email confirmation before sending participation in the collection. The address MUST end with `@company.com` and be present in the corporate directory; the validation rule MUST match the login rule. Until the address is confirmed, proceeding to the next participation step MUST be unavailable.

#### Scenario: Valid corporate email

- **WHEN** the user enters an existing `@company.com` address
- **THEN** the system confirms the address and proceeds to the next participation step

#### Scenario: Address outside the corporate domain

- **WHEN** the user enters an address without the `@company.com` domain
- **THEN** the system shows an error and does not proceed to the next step

#### Scenario: Unknown corporate address

- **WHEN** the user enters the address `unknown.user@company.com`, which is absent from the directory
- **THEN** the system rejects the address the same way as at login and does not proceed to the next step

### Requirement: Collected amounts are hidden from employees

The system MUST hide collected amounts by recipient from users with the `employee` role: neither for themselves nor for other employees. The numeric value of the collected amount MUST NOT be displayed to the employee on any participation step or anywhere on the pages available to them.

#### Scenario: The employee does not see collected amounts

- **WHEN** the employee views the pages and participation steps available to them
- **THEN** the numeric value of the collected amount is not displayed anywhere

#### Scenario: Hidden amount at confirmation

- **WHEN** the employee sees the participation confirmation step
- **THEN** the collected collection amount is not shown; instead, an explanation about hiding is displayed

### Requirement: Employee participation in the collection

The employee MUST be able to specify a positive amount for their participation when confirming their corporate email. The specified amount MUST be added to the total collection of the selected recipient, while the total collected amount MUST NOT be shown to the employee: only their own contribution and an explanation about hiding are displayed.

#### Scenario: The employee specifies a participation amount

- **WHEN** the employee enters a positive amount and confirms sending
- **THEN** the amount is added to the total collection of the selected recipient

#### Scenario: The total amount remains hidden

- **WHEN** the employee goes through the participation steps
- **THEN** only the amount they entered is displayed, and the total collected amount is not shown

### Requirement: Recording participation by the administrator

The administrator MUST be able to specify a participation amount, and the specified amount MUST be added to the total collection of the selected employee. The entered amount MUST be positive.

#### Scenario: Adding an amount by the administrator

- **WHEN** the administrator enters a positive amount and confirms sending
- **THEN** the amount is added to the total collection of the selected recipient

#### Scenario: Invalid amount

- **WHEN** the administrator enters a zero, negative, or empty amount
- **THEN** continuing the scenario is unavailable

### Requirement: A clear participation result

After confirmation, the system MUST show a participation result matching the role: for the employee, confirmation of the sent congratulation; for the administrator, confirmation of the amount being added to the collection. Closing the result MUST end the participation scenario.

#### Scenario: Result for the employee

- **WHEN** the employee completes participation
- **THEN** the system shows confirmation that the congratulation was sent to the recipient

#### Scenario: Result for the administrator

- **WHEN** the administrator completes participation
- **THEN** the system shows confirmation that the amount was added to the recipient's collection
