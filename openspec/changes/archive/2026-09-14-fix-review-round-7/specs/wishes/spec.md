## MODIFIED Requirements

### Requirement: Creating a wish from the form

The system (MUST) allow an authenticated user to create a wish by selecting a recipient only from among today's birthday persons (except themselves) and entering text. The form (MUST) explicitly show the sender (the current user) and clearly indicate the recipient selection. If there is exactly one birthday person today, the form (MUST) automatically fill them into the recipient selection when opened. The created wish (MUST) store the author, recipient, and creation time. Sending (MUST) be blocked while the recipient is not selected or the text is empty.

#### Scenario: Successful creation of a wish

- **WHEN** the user selects a recipient from today's birthday persons and enters non-empty text, then submits the form
- **THEN** the wish is saved with the author, recipient, and creation time and is displayed according to the birthday display rule

#### Scenario: Incomplete data

- **WHEN** no recipient is selected or the text is empty
- **THEN** sending is unavailable

#### Scenario: The form shows the sender and the recipient

- **WHEN** the user opens the wish form
- **THEN** the form shows the current user as the sender and contains a clear recipient selection

#### Scenario: The recipient list is limited to today's birthday persons

- **WHEN** the user opens the recipient selection in the wish form
- **THEN** only employees whose birthday matches the current date are available in the list, and the user themselves is absent from the list

#### Scenario: Auto-selection of the only birthday person

- **WHEN** there is exactly one birthday person today and the user opens the wish form
- **THEN** this birthday person is already selected as the recipient, and the user only has to enter the text

#### Scenario: Several birthday persons — the choice is up to the user

- **WHEN** there are several birthday persons today and the user opens the wish form
- **THEN** the recipient is not selected automatically, and the choice remains with the user

## REMOVED Requirements

### Requirement: Date without time in the wish card

**Reason**: The creation date carries no value on the congratulations board and is removed based on the review results.

**Migration**: The wish card no longer displays the creation date. The creation time continues to be stored in the wish data together with the author and recipient and can be used within the application.
