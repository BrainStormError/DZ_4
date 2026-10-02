## ADDED Requirements

### Requirement: Footer caption wrapping on a narrow screen

The footer caption with the brand and description MUST be readable at widths from 320px: the description MUST NOT begin a line with a dash, and the icon and brand MUST NOT be vertically desynchronized with a multi-line description. When the whole caption does not fit on one line, the brand and description MUST wrap into a centered column.

#### Scenario: Footer at 320px

- **WHEN** the footer is displayed at a width of 320px
- **THEN** the brand and description are placed one below another and centered, and the description line does not begin with a dash

#### Scenario: Footer on a wide screen

- **WHEN** the footer is displayed at a width of `sm` and above
- **THEN** the icon, brand, and description remain on one line, as before
