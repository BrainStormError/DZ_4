## RENAMED Requirements

- FROM: `### Requirement: The wish author is displayed under the corporate nick`
- TO: `### Requirement: Display of the wish author and recipient`

## ADDED Requirements

### Requirement: Showing congratulations by birthday

The wish board MUST show congratulations only for employees whose birthday matches the current date. An administrator MUST be counted as an employee on par with the others. If there are no birthday people today, the board MUST show congratulations for the nearest past birthday date — all employees born on that day. Congratulations for future birthdays MUST NOT ever be shown.

#### Scenario: There is a birthday person today

- **WHEN** one or more employees have a birthday matching the current date
- **THEN** the board shows wishes only for those employees

#### Scenario: There are no birthday people today

- **WHEN** no employee's birthday matches the current date
- **THEN** the board shows wishes for the nearest past birthday date, including all employees born on that day

#### Scenario: No wishes for the nearest birthday person

- **WHEN** there is no wish for the selected birthday date
- **THEN** the system shows an empty state and does not fall through to earlier dates

#### Scenario: Future congratulations are hidden

- **WHEN** a wish is addressed to an employee whose birthday has not yet arrived
- **THEN** this wish is not displayed on the board

#### Scenario: Administrator shown as a birthday person

- **WHEN** the administrator's birthday matches the current date
- **THEN** congratulations for the administrator are displayed on the board just as for any other employee

### Requirement: Congratulation strip for the day's birthday people

All congratulations for the current day's birthday people MUST be displayed as a single looping strip, not a growing grid. The strip MUST smoothly auto-scroll in a loop, and the cards MUST have color highlighting tied to the birthday person. The same strip MUST be used for the nearest past birthday date. Auto-scroll MUST pause on hover or focus and be disabled under `prefers-reduced-motion`, leaving a manually accessible list.

#### Scenario: One shared strip

- **WHEN** there are several birthday people for the current day
- **THEN** all their congratulations are shown in one looping strip

#### Scenario: Color highlighting per birthday person

- **WHEN** the congratulations belong to different birthday people
- **THEN** each birthday person's cards are highlighted with the color assigned to them

#### Scenario: Auto-scroll accessibility

- **WHEN** the user hovers or focuses the strip, or `prefers-reduced-motion` is enabled in the system
- **THEN** auto-scroll pauses or is disabled, and the content remains accessible

## MODIFIED Requirements

### Requirement: Display of the wish author and recipient

The system MUST display the wish author on the board by real name with the corporate nick in parentheses and MUST NOT disclose the full email address. The recipient MUST be displayed by last name and first name. The card MUST explicitly show the direction "From … → To …". Wishes MUST be displayed from newest to oldest within the active display rule.

#### Scenario: Author displayed under the nick

- **WHEN** a wish is left by `dmitry.volkov@company.com` (Dmitry Volkov)
- **THEN** on the board the author is shown as `Dmitry Volkov (dmitry.volkov)`, and the full address is not disclosed

#### Scenario: Recipient displayed by last name and first name

- **WHEN** a wish is addressed to Anna Smirnova
- **THEN** the card shows `To: Anna Smirnova` and an explicit direction from the author to the recipient

#### Scenario: Empty board

- **WHEN** there are no wishes
- **THEN** the system shows an empty state suggesting leaving the first wish

### Requirement: Creating a wish from the form

The system MUST allow an authenticated user to create a wish by selecting a recipient from among the employees (other than themselves) and entering text. The form MUST explicitly show the sender (the current user) and clearly indicate the recipient selection. The created wish MUST store the author, recipient and creation time. Submission MUST be blocked while the recipient is not selected or the text is empty.

#### Scenario: Successful wish creation

- **WHEN** the user selects a recipient and enters non-empty text, then submits the form
- **THEN** the wish is saved with the author, recipient and creation time and is displayed according to the birthday display rule

#### Scenario: Incomplete data

- **WHEN** the recipient is not selected or the text is empty
- **THEN** submission is unavailable

#### Scenario: The form shows the sender and recipient

- **WHEN** the user opens the wish form
- **THEN** the form shows the current user as the sender and contains a clear recipient selection
