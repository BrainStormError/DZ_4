## ADDED Requirements

### Requirement: Calendar navigation on a narrow screen

Month and year navigation MUST remain fully accessible at widths of 320–360px and MUST NOT create horizontal page overflow. The group of toggle buttons MUST wrap or shrink so that all buttons and the current month heading are visible at the same time.

#### Scenario: Navigation at 320px

- **WHEN** the calendar is open at a width of 320px
- **THEN** all month and year toggle buttons and the heading are visible, and the page does not get horizontal scrolling

#### Scenario: Switching the month on a narrow screen

- **WHEN** the user clicks to go to the next month on a narrow screen
- **THEN** the calendar shows the next month, and the navigation remains accessible without changing the page width

### Requirement: Readability of calendar cells on a narrow screen

The contents of a day cell MUST remain readable on narrow screens. On screens smaller than `sm` the names of birthday people MUST NOT be displayed in a clipped form leaving a single letter; instead of the truncated name, a compact birthday marker with the accessible full name MUST be shown.

#### Scenario: A cell with a birthday person on a narrow screen

- **WHEN** a day cell contains a birthday person and the screen is smaller than `sm`
- **THEN** instead of the name clipped to a single letter a compact marker is displayed, and the full name is available to the user

#### Scenario: The birthday marker is distinguishable

- **WHEN** a day has birthdays on a narrow screen
- **THEN** the presence of a birthday person on that day remains visually distinguishable

### Requirement: Grid of upcoming birthday people without clipping names

The grid of the upcoming birthdays block MUST distribute the cards so that the width available for a name does not lead to clipping. The number of columns MUST increase gradually as the screen width grows.

#### Scenario: Tablet width

- **WHEN** the upcoming birthday people block is displayed at a width of about 640px
- **THEN** the number of columns does not lead to clipping of the name, and the card shows the name in full

#### Scenario: Wide layout

- **WHEN** the screen width is sufficient for a larger number of columns
- **THEN** the grid uses a wider layout without losing the readability of names
