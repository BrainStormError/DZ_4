## MODIFIED Requirements

### Requirement: Upcoming birthdays grid without name truncation

The cards of the upcoming birthdays block MUST be displayed so that the employee's last name and first name are not truncated at any screen width from 320px. Where two columns do not leave enough room for the name, the cards MUST be placed one below another in a single column. The number of columns MUST increase gradually as the screen width grows and grow only when the name fits entirely.

#### Scenario: Narrow 320px screen

- **WHEN** the upcoming birthdays block is displayed at a width of 320px
- **THEN** the cards go in one column, and each name is displayed in full

#### Scenario: Mobile width

- **WHEN** the upcoming birthdays block is displayed at a width of 360–414px
- **THEN** the employee's name is not truncated, including if the cards remain in one column for that reason

#### Scenario: Tablet width

- **WHEN** the upcoming birthdays block is displayed at a width of about 640px
- **THEN** the number of columns does not lead to name truncation, and the card shows the name in full

#### Scenario: Wide layout

- **WHEN** the screen width is sufficient for a larger number of columns
- **THEN** the grid uses a wider layout without losing name readability
