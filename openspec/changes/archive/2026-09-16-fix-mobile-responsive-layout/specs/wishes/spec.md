## ADDED Requirements

### Requirement: Hint about horizontal scrolling of the strip

The congratulations strip MUST give a visual hint that it can be scrolled horizontally when the cards do not fit within the available width. The hint MUST NOT appear when all cards fit entirely, and MUST NOT replace manual scrolling with auto-scroll.

#### Scenario: The cards do not fit

- **WHEN** the congratulations cards do not fit within the available width of the strip
- **THEN** the strip shows a sign of horizontal continuation, and scrolling remains manual

#### Scenario: The cards fit

- **WHEN** all cards fit within the available width
- **THEN** the scroll hint is not displayed, and the strip remains static

### Requirement: Stepwise scrolling of the strip cards

During manual horizontal scrolling the strip MUST align the cards to the scroll step so that a card does not remain clipped in the middle. Step alignment MUST NOT enable automatic scrolling and MUST NOT break the keyboard accessibility of the strip.

#### Scenario: Scrolling to the next card

- **WHEN** the user scrolls the strip horizontally
- **THEN** the cards align to the step, and a card does not remain clipped at the edge of the viewport

#### Scenario: Keyboard accessibility is preserved

- **WHEN** the user navigates to the strip with the Tab key
- **THEN** the strip remains available for manual scrolling, and automatic scrolling does not start
