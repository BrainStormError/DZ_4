## ADDED Requirements

### Requirement: The congratulations strip does not loop rendering

Detecting the overflow of the congratulations strip and starting auto-scroll MUST NOT lead to repeated state update loops or main thread freezes. The strip MUST remain responsive when the number of cards changes.

#### Scenario: Transition between the static strip and auto-scroll

- **WHEN** the number of cards changes so that the strip transitions from the static state to scrolling and back
- **THEN** overflow is detected without looping rendering, and the application remains responsive

#### Scenario: No update depth exceeded error

- **WHEN** the strip is displayed and the size observer measures overflow
- **THEN** no maximum update depth exceeded error occurs in the console, and the main thread does not freeze
