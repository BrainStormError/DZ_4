## Purpose

Describes an employee's voluntary participation in a collection for a gift: mandatory selection of the recipient, confirmation of the sender's identity, strict validation of the amount, changing the amount by an administrator, and the correct result of the scenario.

## ADDED Requirements

### Requirement: Mandatory recipient before participation

The system MUST NOT start the participation scenario without a selected recipient. When the common button "Congratulate / send funds" is launched on the home page, the system MUST require selecting a birthday person before proceeding to the participation steps. The participation step texts MUST NOT contain `undefined`, an empty recipient name, or otherwise reveal the absence of a selected employee. Confirmation without a selected recipient MUST NOT end in silent inaction: submission is unavailable with a clear explanation.

#### Scenario: Recipient selected from the birthday person card

- **WHEN** the user opens participation from the birthday person card
- **THEN** all steps display the name of the selected recipient without `undefined`

#### Scenario: Starting participation from the common button without a recipient

- **WHEN** the user clicks "Congratulate / send funds" on the home page without selecting a birthday person
- **THEN** the system requires selecting a recipient, and the participation steps are unavailable or contain a correct recipient selection

#### Scenario: Submission without a selected recipient

- **WHEN** the user tries to confirm participation without a selected recipient
- **THEN** submission is unavailable, the user sees a clear explanation, and the data is not changed

### Requirement: Sender identity matches the account

The corporate email entered in the participation dialog MUST match the address of the current authorized user. On a mismatch, the system MUST show an error and MUST NOT proceed to the next step. The sender displayed at confirmation MUST match the actual author of the wish.

#### Scenario: Another employee's email entered

- **WHEN** the authorized user enters a colleague's corporate email
- **THEN** the system rejects the input with an error and does not proceed to the next step

#### Scenario: Confirmation of a correct sender

- **WHEN** the user enters their own corporate email
- **THEN** their address is displayed at confirmation, and the wish is published under their corporate nickname

### Requirement: Strict validation of the participation amount

Only a positive integer in ordinary decimal notation MUST be accepted for participation. Scientific notation, fractional, zero, negative, empty, and non-numeric values MUST be rejected without truncation (for example, `1e3` MUST NOT turn into `1`). The value shown at confirmation MUST exactly match the amount added to the collection.

#### Scenario: Scientific notation is rejected

- **WHEN** the user enters `1e3`
- **THEN** the value is rejected, and proceeding to the next step is unavailable

#### Scenario: Invalid numeric values

- **WHEN** the user enters `0`, a negative, fractional, or empty value
- **THEN** continuing the scenario is unavailable

#### Scenario: Correct amount is carried over exactly

- **WHEN** the user enters `500` and confirms the submission
- **THEN** exactly 500 ₽ is added to the collection, and the same value is shown at confirmation

### Requirement: A wish without a contribution is not offered in the participation dialog

The participation dialog MUST NOT promise to send a wish without specifying an amount. The text MUST direct the user to the existing "Leave a wish" button on the wish board as a way to congratulate without a contribution.

#### Scenario: Copy of the email confirmation step

- **WHEN** the user opens the corporate email confirmation step
- **THEN** the text does not contain a promise to congratulate without sending funds and points to the wish board

### Requirement: Validation of the amount change by an administrator

When the collection amount is changed by an administrator, the new amount MUST be a non-negative integer. Negative, empty, and non-numeric values MUST NOT be saved and MUST NOT get into the change log. The reason and comment remain mandatory.

#### Scenario: A negative amount is not saved

- **WHEN** the administrator enters a negative amount, selects a reason and comment, and clicks "Save"
- **THEN** the value is not saved, and no negative amount appears in the table or the log

#### Scenario: A correct amount is saved

- **WHEN** the administrator enters a non-negative amount, selects a reason, and specifies a comment
- **THEN** the amount is saved, and a record with the previous and new value is added to the log

### Requirement: Role-based participation result

The result screen MUST correspond to the user's role: an employee sees confirmation of the congratulation sent, an administrator — confirmation of the amount added to the collection. The administrator's result screen MUST NOT mention sending a congratulation to the birthday person.

#### Scenario: Result for an employee

- **WHEN** an employee completes participation
- **THEN** confirmation of the congratulation being sent to the recipient is displayed

#### Scenario: Result for an administrator

- **WHEN** an administrator completes adding an amount
- **THEN** confirmation of the amount being added to the collection is displayed, and there is no text about a delivered congratulation
