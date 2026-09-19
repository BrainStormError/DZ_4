## ADDED Requirements

### Requirement: The collection table is usable on a narrow screen

The collection table MUST remain usable on narrow screens. At mobile sizes the system MUST either present rows as a card list or hide secondary columns so that the key information and the action remain visible. Horizontal scrolling MUST be internal to the table area only and MUST NOT create horizontal page scrolling.

#### Scenario: Table on mobile

- **WHEN** the administrator opens the collection table on a narrow screen
- **THEN** the key information about the employee and the action are available without horizontal page scrolling

#### Scenario: The action column is reachable

- **WHEN** the administrator views an employee row on a narrow screen
- **THEN** the row edit action is reachable and not hidden behind the edge

### Requirement: A single table scroll container

The table area MUST NOT contain nested duplicate horizontal scroll containers. Table scrolling MUST be performed in a single container.

#### Scenario: No double scrolling

- **WHEN** the user scrolls the table horizontally
- **THEN** only a single container scrolls, without nested double scrolling
