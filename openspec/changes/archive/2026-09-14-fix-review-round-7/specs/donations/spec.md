## MODIFIED Requirements

### Requirement: Validation of amount changes by the administrator

When the administrator changes the collection amount, the new amount (MUST) be a non-negative integer. Negative, empty, and non-numeric values (MUST NOT) be saved and (MUST NOT) enter the change log. The reason and comment remain mandatory. For the reason "Refund (gift declined)", the new amount (MUST) equal zero: selecting this reason forcibly sets a zero amount, since declining a gift refunds the entire collection. An emergency refund allows any non-negative amount. For an employee who declined the gift, the amount change (MUST NOT) be available: the amount remains fixed at `0`.

#### Scenario: A negative amount is not saved

- **WHEN** the administrator enters a negative amount, selects a reason and comment, and presses "Save"
- **THEN** the value is not saved, and a negative amount does not appear in the table or the log

#### Scenario: A valid amount is saved

- **WHEN** the administrator enters a non-negative amount, selects a reason, and specifies a comment
- **THEN** the amount is saved, and an entry with the previous and new value is added to the log

#### Scenario: Declining a gift zeroes the amount

- **WHEN** the administrator selects the reason "Refund (gift declined)"
- **THEN** the new amount is set to zero and cannot be saved as non-zero

#### Scenario: An emergency refund allows a partial amount

- **WHEN** the administrator selects the reason "Emergency refund" and specifies a non-negative amount
- **THEN** the amount is saved and enters the change log

#### Scenario: The amount change is unavailable after a decline

- **WHEN** the administrator views the row of an employee who declined the gift
- **THEN** the amount change is unavailable, and the amount remains `0 ₽`

### Requirement: Eligible recipients of a money congratulation

A money congratulation (MUST) be available only for employees whose birthday is today or has not yet arrived in the current year. Employees whose birthday has already passed (MUST NOT) be displayed in the recipient list. The current user themselves (MUST NOT) appear in the list. An employee who declined the gift (MUST NOT) be available as a recipient of a money congratulation: their entry (MUST) be displayed in the selection list as inactive with the note "declined the gift", so that a congratulation is possible only with text.

#### Scenario: A past birthday is excluded from the list

- **WHEN** the user opens the recipient selection for a money congratulation
- **THEN** employees with a past birthday date are absent from the recipient list

#### Scenario: Today's birthday person is available

- **WHEN** an employee's birthday matches the current date
- **THEN** the employee is available in the recipient list for a money congratulation

#### Scenario: A future birthday person is available in advance

- **WHEN** an employee's birthday has not yet arrived in the current year
- **THEN** the employee is available in the recipient list, and funds can be sent in advance

#### Scenario: A person who declined the gift is unavailable for money

- **WHEN** the user opens the recipient selection for a money congratulation
- **THEN** an employee who declined the gift is displayed as an inactive entry and cannot be selected for sending funds

#### Scenario: A note about the decline in the list

- **WHEN** the recipient list contains an employee who declined the gift
- **THEN** their entry contains the note "declined the gift"
