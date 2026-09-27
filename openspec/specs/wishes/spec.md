# wishes Specification

## Purpose

Provides a wish board where the author is displayed under a corporate nickname, and enables creating congratulations for colleagues.

## Requirements

### Requirement: Displaying the author and the recipient of a wish

The system MUST display the wish author on the board by real name with the corporate nickname in parentheses and MUST NOT disclose the full email address. The recipient MUST be displayed by last name and first name. The card MUST explicitly show the direction "From … → To …". Wishes MUST be displayed from newest to oldest within the effective display rule.

#### Scenario: Displaying the author under the nickname

- **WHEN** a wish is left by `dmitry.volkov@company.com` (Dmitry Volkov)
- **THEN** the author is shown on the board as `Dmitry Volkov (dmitry.volkov)`, and the full address is not disclosed

#### Scenario: The recipient is shown by last name and first name

- **WHEN** a wish is addressed to Anna Smirnova
- **THEN** the card shows `To: Anna Smirnova` and an explicit direction from the author to the recipient

#### Scenario: Empty board

- **WHEN** there are no wishes
- **THEN** the system shows an empty state suggesting to leave the first wish

### Requirement: Creating a wish from the form

The system MUST allow an authorized user to create a wish by selecting a recipient only from among today's birthday people (except themselves) and entering text. The form MUST explicitly show the sender (the current user) and clearly indicate the recipient selection. If there is exactly one birthday person today, the form MUST automatically substitute them into the recipient selection when opened. The created wish MUST preserve the author, the recipient, and the creation time. Submission MUST be blocked while the recipient is not selected or the text is empty. **During submission, the form MUST show a loading state (a disabled button with a spinner), on error — an inline notification with a "Retry" button, on success — a toast notification and a form reset.**

#### Scenario: Successful creation of a wish
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
- **THEN** that birthday person is already selected as the recipient, and the user only needs to enter the text

#### Scenario: Several birthday people — the choice is up to the user
- **WHEN** there are several birthday people today and the user opens the wish form
- **THEN** the recipient is not selected automatically, and the choice remains with the user

#### Scenario: Loading state when creating a wish
- **WHEN** the user clicks "Send" with valid data
- **THEN** the button becomes `disabled`, shows `Loader2`, after success — the toast "Wish added", the form is reset, after error — an `Alert` with the error text and a "Retry" button

### Requirement: The "Leave a wish" button on the home page

The "Leave a wish" button in the hero block of the home page MUST open the wish creation form when there are birthday people today, and MUST be inactive when there are no birthday people today. Congratulating in advance without a contribution is impossible — in advance only monetary participation is available.

#### Scenario: Opening the form from the home page

- **WHEN** there is at least one birthday person today and the user clicks "Leave a wish" in the hero block
- **THEN** the wish creation form is displayed

#### Scenario: There are no birthday people today

- **WHEN** no employee's birthday matches the current date
- **THEN** the "Leave a wish" button is inactive and the wish creation form does not open

### Requirement: A congratulation from the participation form creates a wish

When the user congratulates a colleague through the participation form and confirms the submission, the system MUST create a wish on the board in their name regardless of role — both for the employee and for the administrator. Creating the wish MUST occur without disclosing the collection amount to the employee.

#### Scenario: An employee congratulates and adds an entry to the board

- **WHEN** the employee completes the congratulation scenario and confirms the submission
- **THEN** a wish appears on the board in the name of that employee for the selected recipient

#### Scenario: An administrator congratulates and adds an entry to the board

- **WHEN** the administrator completes the congratulation scenario and confirms the submission
- **THEN** a wish appears on the board in the name of the administrator for the selected recipient

#### Scenario: The amount is not disclosed when congratulating

- **WHEN** the user confirms the congratulation
- **THEN** the collection amount is not displayed on the success screen or on the board

### Requirement: Editing a wish by the administrator

The administrator MUST be able to change the text of any wish on the board to moderate bad-faith entries. The edited wish MUST be displayed immediately with the new text; the author, the recipient, and the creation time MUST NOT change. The editing capability MUST NOT be provided to employees. **During saving, the modal MUST show a loading state, on error — a notification with "Retry", on success — a toast and closing of the modal.**

#### Scenario: The administrator corrects the text of a wish
- **WHEN** the administrator changes the text of a wish and saves
- **THEN** the updated text is displayed on the board, and the author, the recipient, and the creation time remain the same

#### Scenario: An employee does not edit wishes
- **WHEN** a user with the `employee` role views the wish board
- **THEN** the editing controls are not displayed

#### Scenario: Loading state when editing a wish
- **WHEN** the administrator clicks "Save" in the editing modal
- **THEN** the button becomes `disabled` with `Loader2`, after success — the toast "Wish updated", the modal closes, after error — an `Alert` with a "Retry" button

### Requirement: Showing congratulations by birthday

The wish board MUST show congratulations only for employees whose birthday matches the current date. The administrator MUST be counted as an employee on a par with the others. If there are no birthday people today, the board MUST show congratulations for the nearest past birthday date — all employees born on that day. Congratulations for future birthdays MUST NEVER be shown.

#### Scenario: There is a birthday person today

- **WHEN** one or more employees' birthday matches the current date
- **THEN** the board shows wishes only for those employees

#### Scenario: There are no birthday people today

- **WHEN** no employee's birthday matches the current date
- **THEN** the board shows wishes for the nearest past birthday date, including all employees born on that day

#### Scenario: No wishes for the nearest birthday person

- **WHEN** there is not a single wish for the selected birthday date
- **THEN** the system shows an empty state and does not move on to earlier dates

#### Scenario: Future congratulations are hidden

- **WHEN** a wish is addressed to an employee whose birthday has not yet occurred
- **THEN** this wish is not displayed on the board

#### Scenario: The administrator is shown as a birthday person

- **WHEN** the administrator's birthday matches the current date
- **THEN** congratulations for the administrator are displayed on the board in the same way as for any employee

### Requirement: A past birthday is read-only

When there are no birthday people today, the board shows congratulations for the nearest past birthday date as a placeholder so that the page is not empty. For this past date the system MUST NOT offer creating new free wishes and MUST NOT offer sending a monetary congratulation.

#### Scenario: The placeholder does not accept new congratulations

- **WHEN** the board shows the nearest past birthday date because there are no birthday people today
- **THEN** new free wishes for this date are unavailable, and the recipients of this date are unavailable for a monetary congratulation

### Requirement: The congratulations strip does not loop rendering

Determining the overflow of the congratulations strip and starting auto-scroll MUST NOT lead to repeated state update loops or freezing of the main thread. The strip MUST remain responsive when the number of cards changes.

#### Scenario: Transition between a static band and auto-scroll

- **WHEN** the number of cards changes so that the strip transitions from a static state to a scrollable one and back
- **THEN** the overflow is determined without looping rendering, and the application remains responsive

#### Scenario: No update-depth-exceeded error

- **WHEN** the strip is displayed and a size observer measures the overflow
- **THEN** no maximum update depth exceeded error occurs in the console, and the main thread does not freeze

### Requirement: Static congratulations strip

All congratulations shown for the selected birthday date MUST be displayed in a single strip, and not in an expanding grid. The strip MUST NOT scroll automatically and MUST NOT contain duplicate cards. When the cards do not fit in the available width, scrolling MUST be performed manually by the user; when the cards fit completely, the strip MUST be displayed as a static band. The cards MUST have a color highlight assigned to the birthday person. The strip MUST remain keyboard-accessible and render correctly under `prefers-reduced-motion`.

#### Scenario: One common strip

- **WHEN** there are several birthday people of the current day
- **THEN** all their congratulations are shown in one strip

#### Scenario: Few congratulations — a static band

- **WHEN** all congratulation cards fit in the available strip width
- **THEN** the strip is static, and each card is displayed exactly once

#### Scenario: Many congratulations — manual scrolling

- **WHEN** the congratulation cards do not fit in the available strip width
- **THEN** the strip does not move on its own, and the user scrolls the available cards manually horizontally

#### Scenario: Color highlight by birthday person

- **WHEN** the congratulations belong to different birthday people
- **THEN** the cards of each birthday person are highlighted with the color assigned to them

#### Scenario: No duplicate cards

- **WHEN** the user views the strip with any number of cards
- **THEN** each card is displayed exactly once, and there are no hidden copies of the content

#### Scenario: Keyboard accessibility of the strip

- **WHEN** the user navigates to the strip with the Tab key
- **THEN** the strip receives focus, and its cards are available for manual scrolling, including under `prefers-reduced-motion`

### Requirement: Hint about horizontal scrolling of the strip

The congratulations strip MUST give a visual hint that it can be scrolled horizontally when the cards do not fit in the available width. The hint MUST NOT appear when all the cards fit completely, and MUST NOT replace manual scrolling with auto-scroll.

#### Scenario: The cards do not fit

- **WHEN** the congratulation cards do not fit in the available strip width
- **THEN** the strip shows an indication of continuation horizontally, and scrolling remains manual

#### Scenario: The cards fit

- **WHEN** all the cards fit in the available width
- **THEN** the scrolling hint is not displayed, and the strip remains static

### Requirement: Stepped scrolling of the strip cards

During manual horizontal scrolling, the strip MUST align the cards to the scroll step so that a card is not left cut off in the middle. Stepped alignment MUST NOT include automatic scrolling and MUST NOT break the keyboard accessibility of the strip.

#### Scenario: Scrolling to the next card

- **WHEN** the user scrolls the strip horizontally
- **THEN** the cards align to the step, and a card is not left cut off at the edge of the viewing area

#### Scenario: Keyboard accessibility is preserved

- **WHEN** the user navigates to the strip with the Tab key
- **THEN** the strip is still available for manual scrolling, and automatic scrolling does not start

### Requirement: Wishes are durable and shared

A wish created through the wish form or through a monetary congratulation, and any text edited by the administrator, MUST be stored in the shared persistent store. The wish MUST remain available after a page reload and after an application restart, and MUST be visible to users other than the author, subject to the existing birthday display rule.

#### Scenario: A created wish survives a reload

- **WHEN** a user creates a wish and reloads the board page
- **THEN** the wish is still displayed according to the birthday display rule

#### Scenario: A wish is visible to another user

- **WHEN** one user creates a wish and another user opens the board
- **THEN** the second user sees the wish

#### Scenario: An administrator edit is durable

- **WHEN** the administrator edits the text of a wish and the board is reloaded
- **THEN** the edited text is displayed, and the author, recipient, and creation time are unchanged

#### Scenario: A created wish is attributed to a stored author

- **WHEN** a wish is created
- **THEN** the stored wish references the creating user and the recipient from the directory, and the board still shows the author's real name with the corporate nickname
