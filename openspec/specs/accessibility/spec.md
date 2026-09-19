# accessibility Specification

## Purpose

Ensures accessibility of the header's interactive elements at all screen sizes, including the mobile layout where text labels are hidden.

## Requirements

### Requirement: Accessible names for header elements

The header's interactive elements MUST have an accessible name that does not depend on the visibility of the text label. The theme toggle and the user menu MUST retain a meaningful accessible name at mobile screen sizes when the text label is hidden. The elements MUST be accessible and activatable from the keyboard.

#### Scenario: Mobile header

- **WHEN** the application is open on a narrow screen where the label text is hidden
- **THEN** the theme toggle and the user menu have an accessible name, and not just an emoji or an image

#### Scenario: Keyboard activation

- **WHEN** the user navigates through the header elements with the Tab key
- **THEN** the element receives focus and is activated with the Enter or Space keys

### Requirement: Minimum tap target size for navigation

The interactive elements of the mobile navigation MUST have a tap area of at least 44×44px so that they can be reliably hit with a finger. Enlarging the tap area MUST NOT break the current layout and MUST NOT create horizontal overflow.

#### Scenario: Tap area size

- **WHEN** the mobile navigation is displayed on a touch device
- **THEN** the tap area height of each item is at least 44px

#### Scenario: Layout is not broken

- **WHEN** the tap areas are enlarged
- **THEN** the navigation items remain aligned, and the page does not get horizontal scroll
