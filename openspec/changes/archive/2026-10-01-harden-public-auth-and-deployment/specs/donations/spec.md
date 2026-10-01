## MODIFIED Requirements

### Requirement: Collected amounts are hidden from employees

The system MUST hide the collected amounts per recipient from users with the `employee` role: neither for themselves nor for other employees. The numeric value of the collected amount MUST NOT be displayed to an employee at any participation step or anywhere on the pages available to them. At the confirmation step only the amount entered by the user themselves is displayed; the total collected amount, as well as a separate explanation about hiding it, MUST NOT be shown. The rule MUST hold for the data an employee receives and not only for what is rendered: no response available to an employee MAY contain the collected amount of any recipient, and none MAY contain the internals of the change journal — the identity of the administrator who made a change, the stored previous and new amounts, or the comment. An employee response MAY carry only the minimum the interface needs, such as which recipients have declined the gift.

#### Scenario: Employee does not see collected amounts

- **WHEN** an employee views the pages available to them and the participation steps
- **THEN** the numeric value of the collected amount is not displayed anywhere

#### Scenario: Hidden amount at confirmation

- **WHEN** an employee sees the participation confirmation step
- **THEN** only the amount they entered is displayed, and the total collected amount and a separate explanation about hiding are absent

#### Scenario: An employee response carries no amounts or journal internals

- **WHEN** an employee loads the data of the application
- **THEN** no collected amount appears in any response available to that employee, and no change-journal entry containing an administrator identity, an amount, or a comment is present

#### Scenario: The administrator still receives the amounts and the journal

- **WHEN** an administrator loads the data of the application
- **THEN** the collected amounts and the change-journal entries with their administrator identity, amounts, and comments are present

#### Scenario: The employee interface still marks a recipient who declined the gift

- **WHEN** an employee opens the recipient selection while a recipient has declined the gift
- **THEN** that recipient is marked as having declined, without any collected amount being disclosed

## ADDED Requirements

### Requirement: Participation amount is bounded

A participation amount MUST be a positive integer within a documented maximum. A value outside the accepted range MUST be refused with a validation error and MUST NOT be added to the collection, and the largest accepted value MUST NOT cause an internal error or an incorrect stored total.

#### Scenario: An amount above the maximum is refused

- **WHEN** a participation is submitted with an amount above the documented maximum
- **THEN** the request is refused with a validation error and the collection of the recipient is unchanged

#### Scenario: The largest accepted amount is stored correctly

- **WHEN** a participation is submitted with the largest accepted amount
- **THEN** the amount is added to the collection and no internal error is produced

#### Scenario: A stored total cannot overflow

- **WHEN** contributions accumulate towards the documented maximum of a recipient
- **THEN** the stored total remains correct and the request that would exceed the accepted range is refused

### Requirement: Recipient eligibility is enforced on the server

A participation MUST be refused, without changing any stored collection, when the recipient is the submitting user, when the recipient's birthday has already occurred in the current year, or when the recipient has declined the gift. A recipient who has declined the gift MUST keep a zero collection: no accepted participation may raise it. A participation for a recipient whose birthday is today or has not yet occurred in the current year MUST be accepted. The refusal MUST be a validation response and MUST NOT be an internal error.

#### Scenario: A contribution to oneself is refused

- **WHEN** a user submits a participation naming themselves as the recipient
- **THEN** the request is refused with a validation response and the collection is unchanged

#### Scenario: A recipient whose birthday has passed is refused

- **WHEN** a user submits a participation for an employee whose birthday has already occurred in the current year
- **THEN** the request is refused and the collection of that employee is unchanged

#### Scenario: A recipient who declined is refused and stays at zero

- **WHEN** a user submits a participation for an employee who declined the gift
- **THEN** the request is refused and the collection of that employee remains zero

#### Scenario: An eligible recipient is accepted

- **WHEN** a user submits a participation for an employee whose birthday is today or has not yet occurred in the current year, and who has not declined the gift
- **THEN** the amount is added to the collection of that employee
