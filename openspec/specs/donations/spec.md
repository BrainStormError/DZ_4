# donations Specification

## Purpose

Allows an employee to participate in a voluntary collection only after confirming their corporate email and guarantees that collection amounts are not disclosed to employees.

## Requirements

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

### Requirement: Administrator records participation

The administrator MUST be able to specify a participation amount, and the specified amount MUST be added to the total collection of the selected employee. The entered amount MUST be positive. **The loading/error/success states are analogous to those of the employee.**

#### Scenario: Adding an amount by the administrator
- **WHEN** the administrator enters a positive amount and confirms the submission
- **THEN** the amount is added to the total collection of the selected recipient

#### Scenario: Invalid amount
- **WHEN** the administrator enters a zero, negative, or empty amount
- **THEN** continuing the scenario is unavailable

#### Scenario: Loading state during administrator participation
- **WHEN** the administrator confirms the submission at any step
- **THEN** the button shows `Loader2` and `disabled`, and the result is a toast/success/error like for the employee

### Requirement: Clear participation result

After confirmation, the system MUST show the participation result, identical for both roles: confirmation that a congratulation has been sent to the recipient. The result screen MUST NOT differ by role and MUST NOT show the collection amount to the employee. **The success screen shows a toast notification, and closing completes the scenario.**

#### Scenario: Result for the employee
- **WHEN** the employee completes participation
- **THEN** the system shows confirmation that a congratulation has been sent to the recipient

#### Scenario: Result for the administrator
- **WHEN** the administrator completes participation
- **THEN** the system shows the same confirmation that a congratulation has been sent to the recipient as for the employee

#### Scenario: Success screen with a toast
- **WHEN** the donation mutation completes successfully
- **THEN** the `success` step is displayed with an icon, text, and the toast notification "Funds added to the collection" / "Congratulation sent"

### Requirement: Mandatory recipient before participation

The system MUST NOT start the participation scenario without a selected recipient. When the common "Congratulate / send funds" button on the home page is triggered, the system MUST require selecting a birthday person before proceeding to the participation steps. The texts of the participation steps MUST NOT contain `undefined`, an empty recipient name, or otherwise disclose the absence of a selected employee. Confirmation without a selected recipient MUST NOT end in silent inaction: submission is unavailable with a clear explanation.

#### Scenario: Recipient selected from a birthday person card

- **WHEN** the user opens participation from a birthday person card
- **THEN** the name of the selected recipient is displayed at all steps without `undefined`

#### Scenario: Starting participation from the common button without a recipient

- **WHEN** the user clicks "Congratulate / send funds" on the home page without selecting a birthday person
- **THEN** the system requires selecting a recipient, and the participation steps are unavailable or contain a correct recipient selection

#### Scenario: Submission without a selected recipient

- **WHEN** the user tries to confirm participation without a selected recipient
- **THEN** submission is unavailable, the user sees a clear explanation, and data is not changed

### Requirement: Sender identity matches the account

The sender of a participation MUST be the authorized user, and the participation dialog MUST NOT contain a control for entering an address. The sender displayed at confirmation MUST match the actual author of the wish, and the stored author MUST be the authorized user.

#### Scenario: Another employee's email was entered

- **WHEN** a participation is submitted by an authorized user
- **THEN** the dialog contains no field for entering an address, and the stored author of the participation and of the wish is the authorized user rather than another employee

#### Scenario: Confirmation of a correct sender

- **WHEN** the user reaches the confirmation step
- **THEN** the displayed sender is the authorized user, and the wish is published under that user's identity

### Requirement: Strict validation of the participation amount

Only a positive integer in ordinary decimal notation MUST be accepted for participation. Scientific notation, fractional, zero, negative, empty, and non-numeric values MUST be rejected without truncation (for example, `1e3` MUST NOT turn into `1`). The value shown at confirmation MUST exactly match the amount added to the collection.

#### Scenario: Scientific notation is rejected

- **WHEN** the user enters `1e3`
- **THEN** the value is rejected, and the transition to the next step is unavailable

#### Scenario: Invalid numeric values

- **WHEN** the user enters `0`, a negative, fractional, or empty value
- **THEN** continuing the scenario is unavailable

#### Scenario: A valid amount is carried over exactly

- **WHEN** the user enters `500` and confirms the submission
- **THEN** exactly 500 ₽ is added to the collection, and this same value is shown at confirmation

### Requirement: A wish without a contribution is not offered in the participation dialog

The participation dialog MUST NOT promise to send a wish without specifying an amount. The text MUST direct the user to the existing "Leave a wish" button on the wish board as a way to congratulate without a contribution.

#### Scenario: Copy of the email confirmation step

- **WHEN** the user opens the participation dialog
- **THEN** the text does not contain a promise to congratulate without sending funds and points to the wish board

### Requirement: Validation of amount change by the administrator

When the administrator changes a collection amount, the new amount MUST be a non-negative integer. Negative, empty, and non-numeric values MUST NOT be saved and MUST NOT end up in the change log. The reason and the comment remain mandatory. For the reason "Refund (gift declined)" the new amount MUST be equal to zero: selecting this reason forcibly sets a zero amount, since declining the gift returns the entire collection. An emergency refund allows any non-negative amount. For an employee who declined the gift, changing the amount MUST NOT be available: the amount remains fixed at `0`.

#### Scenario: A negative amount is not saved

- **WHEN** the administrator enters a negative amount, selects a reason and a comment, and clicks "Save"
- **THEN** the value is not saved, and a negative amount does not appear in the table or the log

#### Scenario: A valid amount is saved

- **WHEN** the administrator enters a non-negative amount, selects a reason, and provides a comment
- **THEN** the amount is saved, and an entry with the previous and the new value is added to the log

#### Scenario: Declining the gift zeroes the amount

- **WHEN** the administrator selects the reason "Refund (gift declined)"
- **THEN** the new amount is set equal to zero and cannot be saved as non-zero

#### Scenario: An emergency refund allows a partial amount

- **WHEN** the administrator selects the reason "Emergency refund" and specifies a non-negative amount
- **THEN** the amount is saved and ends up in the change log

#### Scenario: Amount change is unavailable after a decline

- **WHEN** the administrator views the row of an employee who declined the gift
- **THEN** the amount change is unavailable, and the amount remains `0 ₽`

### Requirement: Optional congratulation when sending funds

When sending a monetary congratulation, the user MUST be able to attach a wish text or send funds without it. If text is provided, the system MUST create a wish that is shown according to the recipient's birthday rule. If text is not provided, the system MUST NOT create a wish and only adds the amount to the collection. The monetary congratulation MUST be sent in advance, regardless of the current date. The participation dialog MUST NOT contain a separate control for sending without a wish: sending without text is performed by continuing the scenario with an empty field.

#### Scenario: Funds with a wish

- **WHEN** the user specifies an amount and a non-empty congratulation text and confirms the submission
- **THEN** the amount is added to the collection, and the wish is created and shown on the board according to the recipient's birthday rule

#### Scenario: Funds without a wish

- **WHEN** the user specifies an amount and leaves the congratulation text empty, then confirms the submission
- **THEN** the amount is added to the collection, and no wish is created

#### Scenario: The only continuation control is without text

- **WHEN** the user leaves the congratulation text empty
- **THEN** continuing the scenario is available with the main button, and there is no separate "send without a wish" button in the dialog

#### Scenario: Result of sending without a wish

- **WHEN** the user completes sending funds without a congratulation text
- **THEN** the result screen reports that the amount has been added to the collection and does not claim that a congratulation has been delivered

#### Scenario: Sending in advance

- **WHEN** the user sends a monetary congratulation before the recipient's birthday
- **THEN** the amount is added to the collection, and the created wish is not shown on the board until the recipient's birthday

### Requirement: Eligible recipients of a monetary congratulation

A monetary congratulation MUST be available only for employees whose birthday is today or has not yet occurred in the current year. Employees whose birthday has already passed MUST NOT be displayed in the recipient list. The current user themselves MUST NOT be included in the list. An employee who declined the gift MUST NOT be available as a recipient of a monetary congratulation: their entry MUST be displayed in the selection list as inactive with the note "declined the gift", so that a congratulation is possible only as text.

#### Scenario: A past birthday is excluded from the list

- **WHEN** the user opens the recipient selection for a monetary congratulation
- **THEN** employees with a past birthday date are absent from the recipient list

#### Scenario: Today's birthday person is available

- **WHEN** an employee's birthday matches the current date
- **THEN** the employee is available in the recipient list for a monetary congratulation

#### Scenario: A future birthday person is available in advance

- **WHEN** an employee's birthday has not yet occurred in the current year
- **THEN** the employee is available in the recipient list, and funds can be sent in advance

#### Scenario: A person who declined the gift is unavailable for money

- **WHEN** the user opens the recipient selection for a monetary congratulation
- **THEN** an employee who declined the gift is displayed as an inactive entry and cannot be selected for sending funds

#### Scenario: Decline note in the list

- **WHEN** the recipient list contains an employee who declined the gift
- **THEN** their entry contains the note "declined the gift"

### Requirement: Recipient email in the selection

The recipient selection form for a monetary congratulation MUST show the recipient's email address in addition to their name and department, so that the user can distinguish employees with the same name and make sure the addressee is correct.

#### Scenario: Email is visible in the recipient list

- **WHEN** the user opens the recipient selection for a monetary congratulation
- **THEN** the name, the department, and the email address are shown for each available recipient

#### Scenario: Email corresponds to the selected recipient

- **WHEN** the user selects a recipient from the list
- **THEN** the subsequent steps relate to the same employee whose email address was shown in the list

### Requirement: Recipient selection is discernible on a narrow screen

The recipient selection form for a monetary congratulation MUST remain usable on narrow screens. Long recipient labels MUST NOT be truncated without the ability to read the full text: the label MUST be truncated neatly with the full value available, and the selection list MUST NOT extend beyond the viewport.

#### Scenario: A long recipient label

- **WHEN** the user opens the recipient list on a narrow screen
- **THEN** the recipient label is truncated predictably, and the full value remains available to the user

#### Scenario: The list does not extend beyond the screen

- **WHEN** the user expands the recipient selection list at a width of 320px
- **THEN** the list fits within the viewport width and is not cut off at the edges

### Requirement: The participation dialog fits the viewport

The participation dialog MUST preserve side margins and a height limit so that no step, including the heading and the action buttons, becomes unavailable on a narrow or short screen.

#### Scenario: Participation steps on mobile

- **WHEN** the user goes through the participation steps on a narrow screen
- **THEN** the heading, the step content, and the action buttons remain within the viewport and are reachable

### Requirement: Collection amounts and the change log are durable and shared

Participation amounts, administrator amount changes with their reason and comment, gift status, and the resulting change-log entries MUST be stored in the shared persistent store. They MUST remain correct after a page reload and after an application restart, and administrative changes MUST be visible to the administrator on any device.

#### Scenario: A participation amount survives a reload

- **WHEN** a participant adds an amount and the collection data is reloaded
- **THEN** the recipient's total includes that amount

#### Scenario: An administrative amount change is durable

- **WHEN** the administrator saves a new amount with a reason and a comment and the data is reloaded
- **THEN** the new amount is shown and the change-log entry with the previous and new values is present

#### Scenario: Gift status is durable

- **WHEN** the administrator marks a recipient's gift as sent or not sent and the data is reloaded
- **THEN** the gift status is unchanged

#### Scenario: A declined gift stays zero

- **WHEN** an amount change with the "refund (gift declined)" reason has been stored and the data is reloaded
- **THEN** the recipient's amount remains zero and further amount changes remain unavailable

#### Scenario: Concurrent participation does not lose an amount

- **WHEN** two contributions to the same recipient are stored
- **THEN** the recipient's total includes both amounts

#### Scenario: Amounts stay an aggregate

- **WHEN** the collection data is read after contributions
- **THEN** only the total per recipient is available, and no per-contributor breakdown is exposed

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
