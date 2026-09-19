## ADDED Requirements

### Requirement: Single birthday person color in the card and the strip

An employee's card in the "Birthday people today" block and the cards of their congratulations in the strip MUST use the same personal color. The color MUST be assigned to the employee deterministically, so that the same birthday person is recognizable in all blocks of the page.

#### Scenario: The card color matches the congratulation color

- **WHEN** an employee is displayed in the "Birthday people today" block and their congratulations are displayed in the strip
- **THEN** the outline of the birthday person's card matches in color the outline of their congratulation cards

#### Scenario: Different birthday people are distinguished by color

- **WHEN** the strip contains congratulations for several birthday people
- **THEN** each birthday person receives their own color, different from the color of another birthday person
