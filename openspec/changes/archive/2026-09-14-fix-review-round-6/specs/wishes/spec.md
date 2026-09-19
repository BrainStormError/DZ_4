## ADDED Requirements

### Requirement: Date without time in the wish card

The wish card on the board (MUST) show the creation date without time. The creation time (MUST) still be stored together with the author and recipient, but (MUST NOT) be displayed on the card.

#### Scenario: The card shows only the date

- **WHEN** the user views a wish card on the board
- **THEN** the card displays the creation date without time

#### Scenario: The creation time is stored

- **WHEN** a wish is created
- **THEN** the creation time is stored in the wish data along with the author and recipient
