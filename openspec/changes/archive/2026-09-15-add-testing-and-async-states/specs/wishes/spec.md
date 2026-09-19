## MODIFIED Requirements

### Requirement: Creating a wish from the form

The system (MUST) allow an authorized user to create a wish by selecting a recipient only from among today's birthday people (except themselves) and entering text. The form MUST explicitly show the sender (the current user) and clearly indicate the choice of recipient. If there is exactly one birthday person today, the form MUST automatically substitute them into the recipient selection when opened. The created wish MUST save the author, the recipient, and the creation time. Submission MUST be blocked until a recipient is selected and the text is non-empty. **While sending, the form MUST show a loading state (a disabled button with a spinner), on error — an inline notification with a "Retry" button, on success — a toast notification and a reset of the form.**

#### Scenario: Successfully creating a wish
- **WHEN** the user selects a recipient from today's birthday people and enters non-empty text, then submits the form
- **THEN** the wish is saved with the author, the recipient, and the creation time and is displayed according to the birthday display rule

#### Scenario: Incomplete data
- **WHEN** the recipient is not selected or the text is empty
- **THEN** submission is unavailable

#### Scenario: The form shows the sender and the recipient
- **WHEN** the user opens the wish form
- **THEN** the form shows the current user as the sender and contains a clear recipient selection

#### Scenario: The recipient list is limited to today's birthday people
- **WHEN** the user opens the recipient selection in the wish form
- **THEN** only employees whose birthday matches the current date are available in the list, and the user themselves is absent from the list

#### Scenario: Auto-selection of the only birthday person
- **WHEN** there is exactly one birthday person today and the user opens the wish form
- **THEN** that birthday person is already selected as the recipient, and the user only needs to enter text

#### Scenario: Multiple birthday people — the choice is up to the user
- **WHEN** there are several birthday people today and the user opens the wish form
- **THEN** the recipient is not selected automatically, and the choice remains with the user

#### Scenario: Loading state when creating a wish
- **WHEN** the user clicks "Send" with valid data
- **THEN** the button becomes `disabled`, shows `Loader2`, after success — the "Wish added" toast, the form is reset, after error — an `Alert` with the error text and a "Retry" button

### Requirement: Editing a wish by the administrator

The administrator MUST be able to change the text of any wish on the board to moderate bad-faith entries. The edited wish MUST immediately be displayed with the new text; the author, the recipient, and the creation time MUST NOT change. The editing capability MUST NOT be provided to employees. **While saving, the modal MUST show a loading state, on error — a notification with "Retry", on success — a toast and closing of the modal.**

#### Scenario: The administrator corrects the text of a wish
- **WHEN** the administrator changes the text of a wish and saves
- **THEN** the updated text is displayed on the board, while the author, the recipient, and the creation time remain the same

#### Scenario: An employee does not edit wishes
- **WHEN** a user with the `employee` role views the wish board
- **THEN** the editing controls are not displayed

#### Scenario: Loading state when editing a wish
- **WHEN** the administrator clicks "Save" in the edit modal
- **THEN** the button becomes `disabled` with `Loader2`, after success — the "Wish updated" toast, the modal closes, after error — an `Alert` with a "Retry" button
