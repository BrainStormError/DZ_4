## Purpose

Provides a wish board where the author is displayed under a corporate nickname and enables creating congratulations for colleagues.

## ADDED Requirements

### Requirement: The wish author is displayed under a corporate nickname

The system MUST display the wish author under a corporate nickname — the part of the corporate email before the `@` symbol, without revealing the full address. Wishes MUST be displayed from new to old and MUST indicate the recipient.

#### Scenario: Displaying the author under a nickname

- **WHEN** a wish is left by `dmitry.volkov@company.com`
- **THEN** the author is shown on the board as `dmitry.volkov`, not as the full address

#### Scenario: Empty board

- **WHEN** there are no wishes
- **THEN** the system shows an empty state suggesting to leave the first wish

### Requirement: Creating a wish from the form

The system MUST allow an authenticated user to create a wish by selecting a recipient from among the employees (other than themselves) and entering text. The created wish MUST appear on the board immediately and preserve the author, recipient, and creation time. Sending MUST be blocked while the recipient is not selected or the text is empty.

#### Scenario: Successful wish creation

- **WHEN** the user selects a recipient and enters non-empty text, then submits the form
- **THEN** the wish appears on the board with the author's nickname and the recipient

#### Scenario: Incomplete data

- **WHEN** the recipient is not selected or the text is empty
- **THEN** sending is unavailable

### Requirement: The "Leave a wish" button on the home page

The "Leave a wish" button in the home page hero block MUST open the wish creation form rather than being inactive.

#### Scenario: Opening the form from the home page

- **WHEN** the user clicks "Leave a wish" in the hero block
- **THEN** the wish creation form is displayed

### Requirement: An employee's congratulation creates a wish

When the employee congratulates a colleague through the participation form and confirms sending, the system MUST create a wish in their name on the board, since the interface reports that the congratulation was delivered to the recipient. Wish creation MUST occur without disclosing the collection amount to the employee.

#### Scenario: A congratulation adds an entry to the board

- **WHEN** the employee completes the congratulation scenario and confirms sending
- **THEN** a wish in the name of this employee appears on the board for the selected recipient

#### Scenario: The amount is not disclosed during congratulation

- **WHEN** the employee confirms the congratulation
- **THEN** the collection amount is not displayed on the success screen or on the board
