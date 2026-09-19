## REMOVED Requirements

### Requirement: Single source of the message about voluntariness and hidden amounts

**Reason**: The statement about collection amount visibility has been removed from the interface, so the requirement to place it in a single canonical place no longer reflects the system's behavior. Deduplication is preserved only for the voluntariness statement.

**Migration**: Use the requirement "Single source of the message about participation voluntariness"; hiding amounts from the employee is governed by the `donations` capability.

## ADDED Requirements

### Requirement: Single source of the message about participation voluntariness

The system MUST present the statement about participation voluntariness in a single canonical place in the interface. The statement about collection amount visibility MUST NOT be placed in the footer or on the home page. On a single page, a statement about voluntariness with the same meaning MUST NOT be repeated more than once outside the context of a specific scenario step.

#### Scenario: Home page without duplicate blocks

- **WHEN** the user opens the home page
- **THEN** the voluntariness statement appears no more than once in the page content (besides the footer), and the collection amount visibility statement is absent from the page

#### Scenario: Footer without a statement about amounts

- **WHEN** the user views the application footer
- **THEN** the footer does not contain a statement about collection amount visibility

#### Scenario: FAQ without duplicate cards

- **WHEN** the user opens the "Questions and answers" section
- **THEN** quick-info cards duplicating the Q1/Q2 answers and the home page text are absent, and the FAQ answers remain the only source of wording
