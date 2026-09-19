## MODIFIED Requirements

### Requirement: A single source of the message about voluntariness and hidden amounts

The system MUST present the statement about the voluntariness of participation and that collection amounts are visible only to the administrator in a single canonical place in the interface. The canonical wording of voluntariness on the home page: "We collect funds for gifts to colleagues for their birthdays. Any employee can join — participation is voluntary." On one page, a statement with the same meaning MUST NOT be repeated more than once outside the context of a specific scenario step.

#### Scenario: Home page without duplicate blocks

- **WHEN** the user opens the home page
- **THEN** the statement about voluntariness and hiding amounts appears no more than once in the page content (aside from the footer), and duplicate hero badge and privacy cards are absent

#### Scenario: FAQ without duplicate cards

- **WHEN** the user opens the "Questions and Answers" section
- **THEN** quick-info cards repeating answers Q1/Q2 and the home page text are absent, and the FAQ answers remain the only source of wording

#### Scenario: Participation dialog without repeated explanations

- **WHEN** the user goes through the steps of the participation dialog
- **THEN** the explanation about hiding the amount is shown no more than once — at the relevant step

#### Scenario: Canonical wording of voluntariness

- **WHEN** the user reads the text about voluntariness on the home page
- **THEN** the text matches the canonical wording and does not contain intensifiers like "completely voluntary"
