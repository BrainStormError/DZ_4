## MODIFIED Requirements

### Requirement: Employee participation in the collection

An employee MUST be able to specify a positive amount of their participation when confirming the corporate email. The specified amount MUST be added to the total collection of the selected recipient, while the final collected amount MUST NOT be shown to the employee: only their own contribution and an explanation about hiding are displayed. **At all steps of the dialog, participation MUST show loading states (a disabled button with a spinner), errors (an Alert with "Retry"), success (a toast and a transition to the next step or the success screen).**

#### Scenario: An employee specifies the participation amount
- **WHEN** an employee enters a positive amount and confirms the submission
- **THEN** the amount is added to the total collection of the selected recipient

#### Scenario: The final amount remains hidden
- **WHEN** an employee goes through the participation steps
- **THEN** only the amount they entered is displayed, and the final collected amount is not shown

#### Scenario: Loading state at the amount step
- **WHEN** the user clicks "Continue" at the amount entry step
- **THEN** the button becomes `disabled` with `Loader2`, after success — a transition to the message step, after error — an `Alert` with a "Retry" button

#### Scenario: Loading state at the confirmation step
- **WHEN** the user clicks "Congratulate" / "Send funds" at the confirmation step
- **THEN** the button becomes `disabled` with `Loader2`, after success — the `success` screen with a toast, after error — an `Alert` with a "Retry" button

### Requirement: Recording participation by the administrator

The administrator MUST be able to specify a participation amount, and the specified amount MUST be added to the total collection of the selected employee. The entered amount MUST be positive. **The loading/error/success states are similar to those of an employee.**

#### Scenario: The administrator adds an amount
- **WHEN** the administrator enters a positive amount and confirms the submission
- **THEN** the amount is added to the total collection of the selected recipient

#### Scenario: Invalid amount
- **WHEN** the administrator enters a zero, negative, or empty amount
- **THEN** continuing the scenario is unavailable

#### Scenario: Loading state when the administrator participates
- **WHEN** the administrator confirms the submission at any step
- **THEN** the button shows `Loader2` and `disabled`, the result is a toast/success/error as for an employee

### Requirement: Clear participation result

After confirmation, the system MUST show the participation result, the same for both roles: confirmation that the congratulation was sent to the recipient. The result screen MUST NOT differ by role and MUST NOT show the collection amount to the employee. **The success screen shows a toast notification; closing ends the scenario.**

#### Scenario: Result for an employee
- **WHEN** an employee completes participation
- **THEN** the system shows confirmation that the congratulation was sent to the recipient

#### Scenario: Result for the administrator
- **WHEN** the administrator completes participation
- **THEN** the system shows the same confirmation that the congratulation was sent to the recipient as for an employee

#### Scenario: Success screen with a toast
- **WHEN** the donation mutation completes successfully
- **THEN** the `success` step is displayed with an icon, text, and a toast notification "Funds added to the collection" / "Congratulation sent"
