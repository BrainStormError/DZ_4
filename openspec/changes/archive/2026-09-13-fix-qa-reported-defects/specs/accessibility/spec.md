## Purpose

Ensures the accessibility of the interactive header elements at all screen sizes, including the mobile layout where the text labels are hidden.

## ADDED Requirements

### Requirement: Accessible names of header elements

The interactive header elements MUST have an accessible name that does not depend on the visibility of the text label. The theme switcher and the user menu MUST retain a meaningful accessible name at the mobile screen size when the text label is hidden. The elements MUST be accessible and activatable from the keyboard.

#### Scenario: Mobile header

- **WHEN** the application is open on a narrow screen where the text label is hidden
- **THEN** the theme switcher and the user menu have an accessible name, not just an emoji or an image

#### Scenario: Keyboard activation

- **WHEN** the user navigates through the header elements with the Tab key
- **THEN** the element receives focus and is activated with the Enter or Space keys
