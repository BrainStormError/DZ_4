## MODIFIED Requirements

### Requirement: Collected amounts are hidden from employees

The system (MUST) hide the collected amounts by recipient from users with the `employee` role: neither for themselves nor for other employees. The numeric value of the collected amount (MUST NOT) be displayed to the employee at any participation step or anywhere on the pages available to them. At the confirmation step, only the amount entered by the user themselves is displayed; the final collected amount, as well as a separate explanation about hiding it, (MUST NOT) be shown.

#### Scenario: An employee does not see collected amounts

- **WHEN** an employee browses the pages available to them and the participation steps
- **THEN** the numeric value of the collected amount is not displayed anywhere

#### Scenario: Hidden amount at confirmation

- **WHEN** an employee sees the participation confirmation step
- **THEN** only the amount they entered is displayed, and the final collected amount and a separate explanation about hiding are absent

### Requirement: Validation of amount changes by the administrator

When the administrator changes the collection amount, the new amount (MUST) be a non-negative integer. Negative, empty, and non-numeric values (MUST NOT) be saved and (MUST NOT) enter the change log. The reason and comment remain mandatory. For the reason "Refund (gift declined)", the new amount (MUST) equal zero: selecting this reason forcibly sets a zero amount, since declining a gift refunds the entire collection. An emergency refund allows any non-negative amount.

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

### Requirement: Optional congratulation when sending money

When sending a money congratulation, the user (MUST) have the ability to attach wish text or send money without it. If text is specified, the system (MUST) create a wish, which is shown according to the recipient's birthday rule. If text is not specified, the system (MUST NOT) create a wish, and only adds the amount to the collection. The money congratulation (MUST) be sent in advance, regardless of the current date. The participation dialog (MUST NOT) contain a separate control for sending without a wish: sending without text is performed by continuing the scenario with an empty field.

#### Scenario: Money with a wish

- **WHEN** the user specifies an amount and non-empty congratulation text and confirms sending
- **THEN** the amount is added to the collection, and the wish is created and shown on the board according to the recipient's birthday rule

#### Scenario: Money without a wish

- **WHEN** the user specifies an amount and leaves the congratulation text empty, then confirms sending
- **THEN** the amount is added to the collection, and no wish is created

#### Scenario: The only control for continuing without text

- **WHEN** the user leaves the congratulation text empty
- **THEN** continuing the scenario is available via the main button, and there is no separate "send without a wish" button in the dialog

#### Scenario: Result of sending without a wish

- **WHEN** the user completes sending money without congratulation text
- **THEN** the result screen reports that the amount has been added to the collection and does not claim that the congratulation was delivered

#### Scenario: Sending in advance

- **WHEN** the user sends a money congratulation before the recipient's birthday
- **THEN** the amount is added to the collection, and the created wish is not shown on the board until the recipient's birthday

## ADDED Requirements

### Requirement: Recipient email in the selection

The recipient selection form for a money congratulation (MUST) show the recipient's corporate email in addition to their name and department, so that the user can distinguish employees with the same name and make sure the addressee is correct.

#### Scenario: The email is visible in the recipient list

- **WHEN** the user opens the recipient selection for a money congratulation
- **THEN** the name, department, and corporate email are shown for each available recipient

#### Scenario: The email matches the selected recipient

- **WHEN** the user selects a recipient from the list
- **THEN** the subsequent steps refer to the same employee whose corporate email was shown in the list
