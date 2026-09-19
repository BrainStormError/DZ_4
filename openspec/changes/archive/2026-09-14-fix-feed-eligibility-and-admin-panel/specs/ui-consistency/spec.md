## MODIFIED Requirements

### Requirement: Single source of the voluntary participation statement

The system MUST present the statement about voluntary participation in one canonical place — the hero block of the home page. The footer MUST NOT contain a statement about voluntary participation. The statement about the visibility of collection amounts MUST NOT be placed in the footer or on the home page. On one page, a statement with the same meaning about voluntariness MUST NOT be repeated more than once outside the context of a specific scenario step.

#### Scenario: Home page without duplicate blocks

- **WHEN** the user opens the home page
- **THEN** the statement about voluntariness occurs exactly once in the hero block, and the statement about the visibility of collection amounts is absent from the page

#### Scenario: Footer without a statement about amounts

- **WHEN** the user views the application footer
- **THEN** the footer contains neither a statement about the visibility of collection amounts nor a statement about voluntary participation

#### Scenario: Footer without a statement about voluntariness

- **WHEN** the user views the application footer
- **THEN** the footer does not contain a statement about voluntary participation

#### Scenario: FAQ without duplicate cards

- **WHEN** the user opens the "Questions and answers" section
- **THEN** quick-info cards that repeat the answers to Q1/Q2 and the home page text are absent, and the FAQ answers remain the only source of the wording
