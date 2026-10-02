## MODIFIED Requirements

### Requirement: Display of congratulations by birthday

The wish board MUST show congratulations only for employees whose birthday coincides with the current date. The administrator MUST be counted as an employee on a par with the others. If there are no birthday people today, the board MUST NOT show congratulations for other dates — neither past nor future. Congratulations for future and past birthdays MUST NOT ever be shown.

#### Scenario: There is a birthday person today

- **WHEN** one or more employees have a birthday that coincides with the current date
- **THEN** the board shows wishes only for those employees

#### Scenario: There are no birthday people today

- **WHEN** no employee's birthday coincides with the current date
- **THEN** the board shows no wishes and does not move to other birthday dates

#### Scenario: No wishes for the nearest birthday person

- **WHEN** there is not a single wish for today's birthday
- **THEN** the system shows an empty state and does not move to other birthday dates

#### Scenario: Congratulations for a past date are hidden

- **WHEN** a wish is addressed to an employee whose birthday has already passed
- **THEN** that wish is not displayed on the board

#### Scenario: Future congratulations are hidden

- **WHEN** a wish is addressed to an employee whose birthday has not yet arrived
- **THEN** that wish is not displayed on the board

#### Scenario: The administrator is shown as a birthday person

- **WHEN** the administrator's birthday coincides with the current date
- **THEN** congratulations for the administrator are displayed on the board just like for any employee

## ADDED Requirements

### Requirement: Empty state of the wish board

When the board cannot show a single card, it MUST remain on the page with the title and explain the reason: when there are no birthday people — that wishes are available on the birthday; when there are birthday people but no wishes — that there are no congratulations yet. The board MUST NOT disappear from the page and MUST NOT replace the empty state with wishes from other dates.

#### Scenario: There are no birthday people today

- **WHEN** no employee's birthday coincides with the current date
- **THEN** the board remains on the page and shows an empty state explaining that wishes are available on the birthday

#### Scenario: There are birthday people, but no wishes

- **WHEN** an employee has a birthday today, but there is not a single wish for them yet
- **THEN** the board shows an empty state with an invitation to leave the first wish

### Requirement: The wish board uses the available width

A congratulation card MUST stretch across the available strip width within the readable maximum, so that on wide screens the board does not leave a one-sided empty field. When the cards do not fill the strip width, the strip MUST be centered; when the cards do not fit, they MUST keep the minimum width, and scrolling remains manual. The strip MUST NOT turn into a grid.

#### Scenario: One wish on a wide screen

- **WHEN** one wish is shown on the board on a wide screen
- **THEN** the card is stretched to the readable maximum, and the strip is centered, so that the free space is distributed at the edges rather than gathered on one side

#### Scenario: Several wishes fit

- **WHEN** the wish cards fit within the strip width
- **THEN** the cards share the available width, and the strip remains a static bar without scrolling

#### Scenario: The cards do not fit

- **WHEN** there are more cards than fit within the strip width
- **THEN** the cards keep the minimum width, the strip scrolls manually and preserves the hint about horizontal scrolling

## REMOVED Requirements

### Requirement: Past birthday read-only

**Reason**: The placeholder showed congratulations for an already past birthday date when there are no birthday people today. The user could not distinguish current congratulations from archived ones and saw congratulations for a person whose birthday had passed. The page emptiness for which the placeholder was introduced is now covered by the board's empty state and by the board using the available width.

**Migration**: The wish data does not change — a wish becomes visible again on the recipient's birthday. Only the display rule changed; no data migrations are required.
