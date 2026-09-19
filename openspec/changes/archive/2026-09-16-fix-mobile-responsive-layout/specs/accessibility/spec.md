## ADDED Requirements

### Requirement: Minimum navigation tap target size

The interactive elements of the mobile navigation MUST have a tap area of at least 44×44px so that they can be reliably hit with a finger. Increasing the tap area MUST NOT break the current layout and MUST NOT create horizontal overflow.

#### Scenario: Tap area size

- **WHEN** the mobile navigation is displayed on a touch device
- **THEN** the tap area height of each item is at least 44px

#### Scenario: The layout does not break

- **WHEN** the tap areas are enlarged
- **THEN** the navigation items remain aligned, and the page does not get horizontal scrolling
