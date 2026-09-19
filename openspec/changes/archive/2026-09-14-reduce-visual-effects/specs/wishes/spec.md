## REMOVED Requirements

### Requirement: Congratulations strip for the day's birthday people

**Reason**: The strip's auto-scroll ran continuously and, together with the duplicate copy of the cards, created a constant load on rendering. It was decided to abandon automatic scrolling.

**Migration**: The requirement is replaced by the requirement "Static congratulations strip": one strip without automatic scrolling, with manual horizontal scroll on overflow and without duplicate cards. The color highlighting of cards by birthday person is preserved.

## ADDED Requirements

### Requirement: Static congratulations strip

All congratulations shown for the selected birthday date MUST be displayed in a single strip rather than an expanding grid. The strip MUST NOT scroll automatically and MUST NOT contain duplicate cards. When the cards do not fit in the available width, scrolling MUST be performed manually by the user; when the cards fit completely, the strip MUST be displayed as a static band. The cards MUST have color highlighting tied to the birthday person. The strip MUST remain keyboard accessible and render correctly with `prefers-reduced-motion`.

#### Scenario: A single shared strip

- **WHEN** there are several birthday people for the current day
- **THEN** all their congratulations are shown in one strip

#### Scenario: Few congratulations — a static band

- **WHEN** all congratulation cards fit in the available width of the strip
- **THEN** the strip is static, and each card is displayed exactly once

#### Scenario: Many congratulations — manual scrolling

- **WHEN** the congratulation cards do not fit in the available width of the strip
- **THEN** the strip does not move on its own, and the user scrolls the available cards manually horizontally

#### Scenario: Color highlighting by birthday person

- **WHEN** the congratulations belong to different birthday people
- **THEN** the cards of each birthday person are highlighted with the color tied to that person

#### Scenario: No duplicate cards

- **WHEN** the user views the strip with any number of cards
- **THEN** each card is displayed exactly once, and there are no hidden copies of the content

#### Scenario: Keyboard accessibility of the strip

- **WHEN** the user navigates to the strip with the Tab key
- **THEN** the strip receives focus, and its cards are available for manual scrolling, including with `prefers-reduced-motion`
