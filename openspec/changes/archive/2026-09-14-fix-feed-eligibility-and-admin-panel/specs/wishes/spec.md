## MODIFIED Requirements

### Requirement: Creating a wish from the form

The system MUST allow an authorized user to create a wish by selecting a recipient only from among today's birthday people (excluding themself) and entering text. The form MUST explicitly show the sender (the current user) and clearly indicate the recipient selection. The created wish MUST store the author, recipient, and creation time. Submission MUST be blocked while the recipient is not selected or the text is empty.

#### Scenario: Successful wish creation

- **WHEN** the user selects a recipient from today's birthday people and enters non-empty text, then submits the form
- **THEN** the wish is saved with the author, recipient, and creation time and is displayed according to the birthday display rule

#### Scenario: Incomplete data

- **WHEN** the recipient is not selected or the text is empty
- **THEN** submission is unavailable

#### Scenario: The form shows the sender and recipient

- **WHEN** the user opens the wish form
- **THEN** the form shows the current user as the sender and contains a clear recipient selection

#### Scenario: The recipient list is limited to today's birthday people

- **WHEN** the user opens the recipient selection in the wish form
- **THEN** only employees whose birthday matches the current date are available in the list, and the user themself is absent from the list

### Requirement: "Leave a wish" button on the home page

The "Leave a wish" button in the hero block of the home page MUST open the wish creation form when there are birthday people today, and MUST be inactive when there are no birthday people today. Congratulating in advance without a contribution is impossible — only money participation is available in advance.

#### Scenario: Opening the form from the home page

- **WHEN** there is at least one birthday person today and the user clicks "Leave a wish" in the hero block
- **THEN** the wish creation form is displayed

#### Scenario: No birthday people today

- **WHEN** no employee's birthday matches the current date
- **THEN** the "Leave a wish" button is inactive and the wish creation form does not open

### Requirement: Congratulations strip for the day's birthday people

All congratulations shown for the selected birthday date MUST be displayed in a single strip, not a growing grid. When the cards do not fit within the available width, the strip MUST smoothly auto-scroll in a loop; when the cards fit completely, the strip MUST be displayed as a static row without duplicate cards. A duplicate copy of the content MUST NOT be visible while auto-scroll is not active. The cards MUST have a color highlight pinned to the birthday person. Auto-scroll MUST pause on hover or focus and be disabled with `prefers-reduced-motion`, leaving an accessible manual list without duplicates.

#### Scenario: One common strip

- **WHEN** there are several birthday people on the current day
- **THEN** all their congratulations are shown in a single strip

#### Scenario: Few congratulations — static row

- **WHEN** all congratulation cards fit within the available strip width
- **THEN** the strip is static, and each card is displayed exactly once

#### Scenario: Many congratulations — auto-scroll

- **WHEN** the congratulation cards do not fit within the available strip width
- **THEN** the strip automatically scrolls in a loop without a visible gap

#### Scenario: Color highlight per birthday person

- **WHEN** the congratulations belong to different birthday people
- **THEN** the cards of each birthday person are highlighted with a color pinned to them

#### Scenario: Auto-scroll accessibility

- **WHEN** the user hovers the cursor or sets focus on the strip, or `prefers-reduced-motion` is enabled in the system
- **THEN** auto-scroll pauses or is disabled, the content remains accessible, and duplicate cards are not displayed

## ADDED Requirements

### Requirement: Past birthday read-only

When there are no birthday people today, the board shows congratulations for the nearest past birthday date as a placeholder, so that the page is not empty. For this past date, the system MUST NOT offer creating new free wishes and MUST NOT offer sending a money congratulation.

#### Scenario: The placeholder does not accept new congratulations

- **WHEN** the board shows the nearest past birthday date because there are no birthday people today
- **THEN** new free wishes for this date are unavailable, and the recipients of this date are unavailable for a money congratulation
