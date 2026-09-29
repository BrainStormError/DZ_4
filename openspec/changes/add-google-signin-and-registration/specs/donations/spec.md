## MODIFIED Requirements

### Requirement: Employee participation in the collection

The employee MUST be able to specify a positive amount for their participation and submit it. The specified amount MUST be added to the total collection of the selected recipient, while the total collected amount MUST NOT be shown to the employee: only their own contribution and an explanation about hiding are displayed. **At all steps of the dialog, participation MUST show loading states (disabled buttons with a spinner), error (Alert with "Retry"), success (a toast and a transition to the next step or the success screen).**

#### Scenario: Employee specifies the participation amount
- **WHEN** the employee enters a positive amount and confirms the submission
- **THEN** the amount is added to the total collection of the selected recipient

#### Scenario: The total amount remains hidden
- **WHEN** the employee goes through the participation steps
- **THEN** only the amount they entered is displayed, and the total collected amount is not shown

#### Scenario: Loading state at the amount step
- **WHEN** the user clicks "Continue" at the amount entry step
- **THEN** the button becomes `disabled` with `Loader2`, after success — a transition to the message step, after error — an `Alert` with a "Retry" button

#### Scenario: Loading state at the confirmation step
- **WHEN** the user clicks "Congratulate" / "Send funds" at the confirmation step
- **THEN** the button becomes `disabled` with `Loader2`, after success — the `success` screen with a toast, after error — an `Alert` with a "Retry" button

### Requirement: Sender identity matches the account

The sender of a participation MUST be the authorized user, and the participation dialog MUST NOT contain a control for entering an address. The sender displayed at confirmation MUST match the actual author of the wish, and the stored author MUST be the authorized user.

#### Scenario: Another employee's email was entered

- **WHEN** a participation is submitted by an authorized user
- **THEN** the dialog contains no field for entering an address, and the stored author of the participation and of the wish is the authorized user rather than another employee

#### Scenario: Confirmation of a correct sender

- **WHEN** the user reaches the confirmation step
- **THEN** the displayed sender is the authorized user, and the wish is published under that user's identity

### Requirement: A wish without a contribution is not offered in the participation dialog

The participation dialog MUST NOT promise to send a wish without specifying an amount. The text MUST direct the user to the existing "Leave a wish" button on the wish board as a way to congratulate without a contribution.

#### Scenario: Copy of the email confirmation step

- **WHEN** the user opens the participation dialog
- **THEN** the text does not contain a promise to congratulate without sending funds and points to the wish board

### Requirement: Recipient email in the selection

The recipient selection form for a monetary congratulation MUST show the recipient's email address in addition to their name and department, so that the user can distinguish employees with the same name and make sure the addressee is correct.

#### Scenario: Email is visible in the recipient list

- **WHEN** the user opens the recipient selection for a monetary congratulation
- **THEN** the name, the department, and the email address are shown for each available recipient

#### Scenario: Email corresponds to the selected recipient

- **WHEN** the user selects a recipient from the list
- **THEN** the subsequent steps relate to the same employee whose email address was shown in the list

## REMOVED Requirements

### Requirement: Confirmation of corporate email before participation

**Reason**: The participant is identified by the authorized session, so entering an address in the dialog proved nothing and blocked nobody; the step and its validation rule are removed together with the corporate-email rule.

**Migration**: Participation starts at the recipient selection and continues to the amount, message, and confirmation steps. The sender and the stored author are the authorized user, as stated by "Sender identity matches the account".
