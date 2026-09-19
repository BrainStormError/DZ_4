# ui-consistency Specification

## Purpose

Ensures uniformity of user wording and controls: one statement — one source, one action — one primary control, and interactive and reference elements are not duplicated and do not mislead.

## Requirements

### Requirement: Single source of the statement about voluntary participation

The system MUST present the statement about the voluntary nature of participation in one canonical place — the hero block of the home page. The footer MUST NOT contain the statement about the voluntary nature of participation. The statement about the visibility of collection amounts MUST NOT be placed in the footer or on the home page. On one page, a statement about voluntariness that is identical in meaning MUST NOT be repeated more than once outside the context of a specific scenario step.

#### Scenario: Home page without duplicate blocks

- **WHEN** the user opens the home page
- **THEN** the statement about voluntariness occurs exactly once in the hero block, and the statement about the visibility of collection amounts is absent from the page

#### Scenario: Footer without the amounts statement

- **WHEN** the user views the application footer
- **THEN** the footer contains neither the statement about the visibility of collection amounts nor the statement about the voluntary nature of participation

#### Scenario: Footer without the voluntariness statement

- **WHEN** the user views the application footer
- **THEN** the footer does not contain the statement about the voluntary nature of participation

#### Scenario: FAQ without duplicate cards

- **WHEN** the user opens the "Questions and answers" section
- **THEN** the quick-info cards that repeat the answers to Q1/Q2 and the home page text are absent, and the FAQ answers remain the only source of wording

### Requirement: One primary control per action

Each user action MUST have one primary control in its area. Controls that launch the same scenario with the same context MUST NOT be displayed simultaneously. Different entry points for different entities (for example, a card of a specific birthday person) are allowed.

#### Scenario: Congratulation without a contribution

- **WHEN** the user is on the home page
- **THEN** the "wish without a contribution" action is available through one primary control, without simultaneous duplication by a separate button in the wish board area

#### Scenario: Expanding the wish form

- **WHEN** the user activates the primary wish control
- **THEN** the form switches to the open state, and a repeated control does not create a second independent form

### Requirement: Interactive elements perform an action

Elements styled as a command (a button, a menu item) MUST perform an action. Information that does not imply an action MUST NOT be presented as an interactive command.

#### Scenario: User menu without a non-interactive item

- **WHEN** the user opens the user menu in the header
- **THEN** the department is displayed as non-interactive information or is absent, and there is no item in the menu that looks clickable but does not perform an action

### Requirement: Single source of refund reason labels

Refund reason labels MUST be generated from a single source. For the same reason, divergent hardcoded wordings MUST NOT exist in different places of the interface.

#### Scenario: Consistency of the reason in the selection and the log

- **WHEN** the administrator selects a reason for changing an amount and then views the change log
- **THEN** the wording of the reason matches, since it is taken from a single source

### Requirement: No unused UI primitives

The project MUST NOT contain UI components and modules that are not referenced from the application's reachable code.

#### Scenario: Build without unreachable modules

- **WHEN** the project's build and type check are performed
- **THEN** there are no imports of removed unused UI modules, and the build completes without errors
