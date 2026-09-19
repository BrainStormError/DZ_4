## ADDED Requirements

### Requirement: Recipient selection is distinguishable on a narrow screen

The recipient selection form for a monetary congratulation MUST remain usable on narrow screens. Long recipient labels MUST NOT be clipped without the ability to read the full text: the label MUST be truncated neatly with the full value accessible, and the selection list MUST NOT go outside the viewport.

#### Scenario: Long recipient label

- **WHEN** the user opens the recipient list on a narrow screen
- **THEN** the recipient label is truncated predictably, and the full value remains available to the user

#### Scenario: The list does not go outside the screen

- **WHEN** the user expands the recipient selection list at a width of 320px
- **THEN** the list fits within the viewport width and is not clipped at the edges

### Requirement: The participation dialog fits within the viewport

The participation dialog MUST preserve side margins and a height limit so that no step, including the header and the action buttons, becomes unreachable on a narrow or short screen.

#### Scenario: Participation steps on mobile

- **WHEN** the user goes through the participation steps on a narrow screen
- **THEN** the header, the step content, and the action buttons remain inside the viewport and are reachable
